// providers/appwrite/database.ts

import { tablesDB } from ".";
import {
	ID,
	Query,
	AppwriteException,
	Permission,
	Role,
} from "react-native-appwrite";
import { APPWRITE_KEYS } from "@/constants/keys";
import type { Failure, Result, Success } from "./types";
import {
	ProfileSchema,
	StudentSchema,
	type Profile,
	type Student,
} from "@/types";
import { ZodError } from "zod";
import type { User } from "./auth";

// Constants for the database and its collections
const { DATABASE_ID, STUDENT_COLLECTION_ID, PROFILE_COLLECTION_ID } =
	APPWRITE_KEYS;

/**
 * Generic error-handling helper
 */
const handleError = (error: unknown): Failure => {
	if (error instanceof AppwriteException) {
		console.warn("Appwrite Error:", error);
		const message = error.message || "En ukjent feil oppstod";
		switch (error.code) {
			case 400:
				return { success: false, error: "Ugyldige data" };
			case 401:
				return { success: false, error: "Ikke tilgang" };
			case 404:
				return { success: false, error: "Ikke funnet" };
			case 409:
				return { success: false, error: "E-postadressen er allerede i bruk" };
			case 500:
				return { success: false, error: "Serverfeil" };
			default:
				return { success: false, error: message };
		}
	}
	if (error instanceof ZodError) {
		console.warn("Database Error:", error);
		return {
			success: false,
			error: error.message || "En ukjent feil oppstod",
		};
	}

	return {
		success: false,
		error: error instanceof Error ? error.message : "En ukjent feil oppstod",
	};
};

/**
 * Helper for successful API responses
 */
const handleResponse = <T>(response: T): Success<T> => {
	return { success: true, data: response };
};

/**
 * Wrapper for async operations with error handling
 */
const asyncWrapper = async <T>(
	operation: () => Promise<T>,
): Promise<Result<T>> => {
	try {
		const response = await operation();
		return handleResponse(response);
	} catch (error: unknown) {
		return handleError(error);
	}
};

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
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: PROFILE_COLLECTION_ID,
			queries: [Query.startsWith("email", email)],
		});
		console.log("Response:", response);
		return await Promise.all(
			response.rows.map((profile) => ProfileSchema.parseAsync(profile)),
		);
	});
};

/**
 * Get all students
 */
export const getStudents = async (): Promise<Result<Student[]>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
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
export const getStudentsByUser = async (
	userId: string,
): Promise<Result<Student[]>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.listRows({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			queries: [Query.equal("userId", userId)],
		});

		const students = await Promise.all(
			response.rows.map((student) => StudentSchema.parseAsync(student)),
		);

		return students;
	});
};

/**
 * Create a new student
 */
export const createStudent = async (
	student: Student,
): Promise<Result<Student>> => {
	const parsedStudent = StudentSchema.parse(student);
	const userId = parsedStudent.userId;

	if (!userId) {
		throw new AppwriteException("User ID is required", 400);
	}

	return asyncWrapper(async () => {
		const response = await tablesDB.createRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: ID.unique(),
			data: parsedStudent,
			permissions: [
				Permission.read(Role.user(userId)),
				// Permission.read(Role.user(user.$id)),
				// Permission.write(Role.user(user.$id)),
				// Permission.update(Role.user(user.$id)),
				// Permission.delete(Role.user(user.$id)),
			],
		});

		return StudentSchema.parse(response);
	});
};

/**
 * Update an existing student
 */
export const updateStudent = async (
	id: string,
	student: Partial<Student>,
): Promise<Result<Student>> => {
	return asyncWrapper(async () => {
		const response = await tablesDB.updateRow({
			databaseId: DATABASE_ID,
			tableId: STUDENT_COLLECTION_ID,
			rowId: id,
			data: student,
		});

		return StudentSchema.parse(response);
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
