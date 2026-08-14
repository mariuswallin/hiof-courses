// providers/appwrite/auth.ts

import { ROLES, type Role } from "@/types";
import { account } from ".";
import { ID, type AppwriteException, type Models } from "react-native-appwrite";
import type { Failure, Result, Success } from "./types";
import { APPWRITE_KEYS } from "@/constants/keys";
import { createProfile } from "./database";

// Extended user type that carries the role information.
// `id` is an optional fallback for when Appwrite does not provide `$id`.
export type User = Models.User<Models.Preferences> & {
	role: Role;
	id?: string;
};
export type Session = Models.Session;

// Converts Appwrite error codes into user-friendly messages, and standardizes
// error responses so the UI has less to handle

const handleError = (error: AppwriteException): Failure => {
	console.warn("ErrorHandler:", error);
	switch (error.code) {
		case 401:
			return { success: false, error: "Invalid credentials" };
		case 404:
			return { success: false, error: "User not found" };
		case 409:
			return { success: false, error: "Email already in use" };
		default:
			return { success: false, error: "An unknown error occurred" };
	}
};

// Helper that reads the user role out of the preferences. Returns the default
// USER role when no valid role is present.
const extractRole = (prefs: Models.Preferences): Role => {
	const role = (prefs as { role?: string })?.role;
	if (role && Object.keys(ROLES).includes(role)) {
		return role as Role;
	}
	return ROLES.USER;
};

// Helper for successful API responses — wraps them in a standard Success object
const handleResponse = <T>(response: T): Success<T> => {
	console.log("ResponseHandler:", response);
	return { success: true, data: response };
};

// Sign in with email and password. Uses promise chaining (.then/.catch) to
// handle the result and any error.
export const login = (email: string, password: string) =>
	account
		.createEmailPasswordSession({ email, password })
		.then(handleResponse)
		.catch(handleError);

// Register a new user
export const register = (email: string, password: string) =>
	account
		.create({ userId: ID.unique(), email, password })
		.then(handleResponse)
		.catch(handleError);

// Sign the user out (ends the current session)
export const logout = () =>
	account
		.deleteSession({ sessionId: "current" })
		.then(handleResponse)
		.catch(handleError);

// Set the user's role in the preferences for the signed-in user.
// Called right after registration, when prefs are empty — so replacing the
// whole prefs object is safe (updatePrefs overwrites everything).
export const setUserRole = (role: Role) =>
	account
		.updatePrefs({ prefs: { role } })
		.then(handleResponse)
		.catch(handleError);

// Get the signed-in user's information
export const getUser = () =>
	account.get().then(handleResponse).catch(handleError);

// Get only the signed-in user's role
export const getUserRole = (): Promise<Result<Role>> =>
	account.getPrefs().then(extractRole).then(handleResponse).catch(handleError);

// Get the signed-in user's information together with their role. Promise.all
// runs the two API calls in parallel, then the results are combined.
export const getUserWithRole = async () => {
	const result = await Promise.all([getUser(), getUserRole()]);
	const [user, role] = result;
	if (user.success) {
		return {
			success: true,
			data: {
				...user.data,
				role: role.success ? role.data : ROLES.USER,
			},
		} as Success<User>;
	}

	return user;
};

// Sign in and fetch the user information in one go — an example of a composite
// operation with sequential steps
export const loginAndGetUser = async (email: string, password: string) => {
	const loginResult = await login(email, password);
	if (!loginResult.success) {
		return loginResult;
	}
	return getUserWithRole();
};

// Register a new user and sign in within the same operation, to set up a new
// user and log them straight in. Also creates a profile for the new user.
export const signUpAndLogin = async (
	email: string,
	password: string,
	admin = false,
) => {
	const registerResult = await register(email, password);
	if (!registerResult.success) {
		return registerResult;
	}

	// A session must be active before preferences can be updated or the role read.
	const loginResult = await login(email, password);
	if (!loginResult.success) {
		return loginResult;
	}

	// Set the admin role BEFORE fetching user-with-role. Without this, new admin
	// accounts come back as USER, guarded routes (for example /list) never mount,
	// and the redirect there lands on +not-found ("Oops").
	if (admin) {
		const roleResult = await setUserRole(ROLES.ADMIN);
		if (!roleResult.success) {
			console.warn("Failed to set admin role:", roleResult.error);
		}
	}

	const result = await getUserWithRole();

	if (!result.success) {
		return result;
	}

	const createProfileResult = await createProfile({
		email,
		userId: result.data.$id,
	});

	if (!createProfileResult.success) {
		// Rollback is not handled if creating the profile fails — it has to be sorted
		// out manually for now.
		console.warn("Failed to create profile:", createProfileResult.error);
	}

	return result;
};
