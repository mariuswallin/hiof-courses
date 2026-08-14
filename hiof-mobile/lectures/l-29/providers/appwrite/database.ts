// providers/appwrite/database.ts

import { tablesDB } from ".";
import { ID, Query, AppwriteException } from "react-native-appwrite";
import { APPWRITE_KEYS } from "@/constants/keys";
import type { Failure, Result } from "./types";
import {
	ProfileSchema,
	StudentSchema,
	type Profile,
	type Student,
	type StudentWithId,
} from "@/types";

import { getStudentsWithCursorMock } from "@/constants/students";
import { asyncWrapper } from "./lib";
import { handleFileUpload } from "./storages";

// Constants for the database and its tables (previously collections).
// The collection IDs work as table IDs in TablesDB.
const { DATABASE_ID, STUDENT_COLLECTION_ID, PROFILE_COLLECTION_ID } =
	APPWRITE_KEYS;

/**
 * Check whether a profile exists
 */
export const profileExists = async (
	email: string,
): Promise<Result<boolean>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: PROFILE_COLLECTION_ID,
			queries: [Query.equal("email", email)],
		});
		return response.total > 0;
	});
};

/**
 * Create a new profile
 */
export const createProfile = async (profile: {
	email: string;
	userId: string;
}): Promise<Result<Profile | Failure>> => {
	return asyncWrapper(async () => {
		const parsedProfile = ProfileSchema.parse(profile);
		const profileExistsResult = await profileExists(parsedProfile.email);

		if (profileExistsResult.success && profileExistsResult.data) {
			throw new AppwriteException("Profile already exists", 409);
		}

		const response = await tablesDB.createRow({
			databaseId: DATABASE_ID,
			tableId: PROFILE_COLLECTION_ID,
			rowId: ID.unique(),
			data: profile,
		});
		return ProfileSchema.parseAsync(response);
	});
};

/**
 * Search for a profile by email
 */
export const getProfileByEmail = async (
	email: string,
): Promise<Result<Profile[]>> => {
	return asyncWrapper(async () => {
		const students = await getStudents();
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: PROFILE_COLLECTION_ID,
			queries: [Query.startsWith("email", email), Query.limit(10)],
		});

		let allowedProfiles = response.rows;

		if (students.success && students.data.length > 0) {
			allowedProfiles = allowedProfiles.filter((profile) => {
				// every() checks that no student is linked to a profile
				const profileNotUsed = students.data.every(
					(student) => student.userId !== profile.userId,
				);
				return profileNotUsed;
			});
		}

		return await Promise.all(
			allowedProfiles.map((profile) => ProfileSchema.parseAsync(profile)),
		);
	});
};

/**
 * Get students with cursor pagination
 */
export const getStudentsWithCursor = async (
	pageParam: string,
	testing = false,
): Promise<
	Result<{ students: StudentWithId[]; nextCursor: string | null }>
> => {
	if (testing) {
		// The mock data has no Appwrite `$id`; casting is safe in test mode.
		return getStudentsWithCursorMock(pageParam) as Promise<
			Result<{ students: StudentWithId[]; nextCursor: string | null }>
		>;
	}
	return asyncWrapper(async () => {
		const query = pageParam
			? [Query.limit(10), Query.cursorAfter(pageParam)]
			: [Query.limit(10)];

		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			queries: query,
		});

		const errors: string[] = [];

		// Validate the data and pull out the student IDs, to use one as the cursor
		const students = response.rows
			.map((student) => {
				const parsedStudent = StudentSchema.safeParse(student);
				if (!parsedStudent.success) {
					errors.push(parsedStudent.error.message);
					return null;
				}
				return { ...parsedStudent.data, $id: student.$id };
			})
			.filter(Boolean) as StudentWithId[];

		// On validation errors, log them and throw an AppwriteException
		if (errors.length > 0) {
			console.warn("Validation errors:", errors);
			throw new AppwriteException(
				"Validation errors occurred while processing students",
				400,
			);
		}

		// Take the last student's ID to use as the cursor
		const nextCursor =
			students.length > 0 ? students[students.length - 1].$id : null;

		return {
			students,
			nextCursor,
		};
	});
};

/**
 * Get all students
 */
export const getStudents = async (filter?: { isActive: boolean }): Promise<
	Result<Student[]>
> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			queries: [
				Query.limit(100),
				Query.orderDesc("$createdAt"),
				Query.equal("isActive", filter?.isActive ?? true),
			],
		});

		return await Promise.all(
			response.rows.map((student) => StudentSchema.parseAsync(student)),
		);
	});
};

/**
 * Get one student by ID
 */
export const getStudent = async (id: string): Promise<Result<Student>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.getRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: id,
		});
		return await StudentSchema.parseAsync(response);
	});
};

/**
 * Get the students for a given user
 */
export const getStudentIdByUser = async (
	userId: string,
): Promise<Result<Student>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			queries: [Query.equal("userId", userId)],
		});

		const students = await Promise.all(
			response.rows.map((student) => StudentSchema.parseAsync(student)),
		);

		// With no students, throw an AppwriteException — otherwise the UI breaks
		if (students.length === 0) {
			throw new AppwriteException("Student not found", 404);
		}

		return students[0];
	});
};

/**
 * Create a new student
 */
export const createStudent = async (
	student: Student,
): Promise<Result<StudentWithId>> => {
	const parsedStudent = StudentSchema.parse(student);
	const userId = parsedStudent.userId;

	if (!userId) {
		throw new AppwriteException("User ID is required", 400);
	}

	return asyncWrapper(async () => {
		const imageResult = await handleFileUpload(parsedStudent.image);

		if (!imageResult.success) {
			console.warn(
				"Bildeopplasting feilet – lagrer student uten bilde:",
				imageResult.error,
			);
		}

		const response = await tablesDB.createRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: ID.unique(),
			data: {
				...parsedStudent,
				image: imageResult.success ? imageResult.data : null,
			},
		});

		const parsedResponseStudent = await StudentSchema.safeParseAsync(response);
		if (!parsedResponseStudent.success) {
			throw new AppwriteException("Failed to parse student", 400);
		}

		return {
			...parsedResponseStudent.data,
			$id: response.$id,
		} as StudentWithId;
	});
};

/**
 * Update an existing student
 */
export const updateStudent = async (
	id: string,
	student: Partial<Student>,
): Promise<Result<StudentWithId>> => {
	return asyncWrapper(async () => {
		const shouldUploadImage = student.image && !student.image.includes("http");

		const imageResult = shouldUploadImage
			? await handleFileUpload(student.image)
			: { success: true as const, data: student.image };

		if (!imageResult.success) {
			console.warn(
				"Bildeopplasting feilet – oppdaterer student uten bilde:",
				imageResult.error,
			);
		}

		const response = await tablesDB.updateRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: id,
			data: {
				...student,
				image: imageResult.success ? imageResult.data : null,
			},
		});

		const parsedStudent = await StudentSchema.safeParseAsync(response);
		if (!parsedStudent.success) {
			throw new AppwriteException("Failed to parse student", 400);
		}
		return {
			...parsedStudent.data,
			$id: response.$id,
		};
	});
};

/**
 * Delete a student
 */
export const deleteStudent = async (id: string): Promise<Result<boolean>> => {
	return asyncWrapper(async () => {
		await tablesDB.deleteRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: id,
		});
		return true;
	});
};
