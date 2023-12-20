import { chunks } from '../utils/arrayUtils';

describe('chunks function', () => {
	it('should return an empty array if size is less than 1', () => {
		expect(chunks([1, 2, 3], 0)).toEqual([]);
	});

	it('should return an empty array if the input array is empty', () => {
		expect(chunks([], 2)).toEqual([]);
	});

	it('should split the array into chunks of the specified size', () => {
		const inputArray = [1, 2, 3, 4, 5, 6];
		const size = 2;
		const expectedResult = [
			[1, 2],
			[3, 4],
			[5, 6],
		];
		expect(chunks(inputArray, size)).toEqual(expectedResult);
	});

	it('should split the array into chunks of size 1 if size is not specified', () => {
		const inputArray = [1, 2, 3, 4, 5, 6];
		const expectedResult = [[1], [2], [3], [4], [5], [6]];
		expect(chunks(inputArray)).toEqual(expectedResult);
	});

	it('should not modify the original array', () => {
		const inputArray = [1, 2, 3, 4, 5, 6];
		const size = 2;
		chunks(inputArray, size);
		expect(inputArray).toEqual(inputArray);
	});
});
