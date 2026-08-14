const arr = [];

const hasLength = !!arr.length;
const isEmpty = !arr.length;

const isNotEmpty = arr.length > 0;
const hasNoData = arr.length === 0;
console.log(hasLength);

// Bedre en å sjekke !hasLength
console.log(isEmpty);
console.log(isNotEmpty);
console.log(hasNoData);
