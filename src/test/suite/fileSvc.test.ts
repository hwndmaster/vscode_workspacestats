import * as assert from 'assert';
import * as fileSvc from '../../fileSvc';

suite('File Service Test Suite', () => {
	test('Path.ShrinkPath When_long_path_provided', () => {
		// Arrange
		const path = "C:\\Some Long Path\\With Sub Folders\\And Ends with\\filename.txt";
		const maxLength = 40;

		// Act
		const result = fileSvc.Path.shrinkPath(path, maxLength);

		// Assert
		assert.strictEqual(result, "C:\\Some Long P... Ends with\\filename.txt");
	});

	test('Path.ShrinkPath When_short_path_provided', () => {
		// Arrange
		const path = "C:\\Short path\\filename.txt";
		const maxLength = 40;

		// Act
		const result = fileSvc.Path.shrinkPath(path, maxLength);

		// Assert
		assert.strictEqual(result, "C:\\Short path\\filename.txt");
	});
});
