// Type for a successful response. Generic, so it supports different data types.
export type Success<T> = {
	success: true;
	data: T;
};

// Type for a failed response
export type Failure = {
	success: false;
	error: string;
};

// Union type representing either a successful or a failed operation. This is a
// discriminated union: the success field tells us which variant we have.
export type Result<T> = Success<T> | Failure;
