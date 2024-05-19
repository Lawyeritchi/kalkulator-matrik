document.addEventListener('DOMContentLoaded', () => {
    const determinantBtn = document.getElementById('determinantBtn');
    const transposeBtn = document.getElementById('transposeBtn');
    const inverseBtn = document.getElementById('inverseBtn');
    const mainWrapper = document.getElementById('main-wrapper');
    
    let storedMatrix = null;
    let currentRows = 2;
    let currentColumns = 2;

    function createMatrixInputs(rows, columns) {
        const matrixForm = document.getElementById('matrix-form');
        matrixForm.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            const rowDiv = document.createElement('div');
            for (let j = 0; j < columns; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.classList.add('num-input', 'matrix-entry');
                input.name = `${i},${j}`;
                input.value = storedMatrix && storedMatrix[i] && storedMatrix[i][j] !== undefined ? storedMatrix[i][j] : '0';
                rowDiv.appendChild(input);
            }
            matrixForm.appendChild(rowDiv);
        }
    }

    function getMatrixValues(rows, columns) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < columns; j++) {
                const input = document.querySelector(`input[name="${i},${j}"]`);
                const value = parseFloat(input.value);
                if (isNaN(value)) throw new Error('Input Tidak Valid');
                row.push(value);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function calculateDeterminant(matrix) {
        if (matrix.length !== matrix[0].length) {
            throw new Error('Sisi Matrik Tidak Sama');
        }
        const n = matrix.length;
        if (n === 1) return matrix[0][0];
        if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

        let determinant = 0;
        for (let i = 0; i < n; i++) {
            const minor = matrix.slice(1).map(row => row.filter((_, j) => j !== i));
            determinant += ((i % 2 === 0 ? 1 : -1) * matrix[0][i] * calculateDeterminant(minor));
        }
        return determinant;
    }

    function calculateTranspose(matrix) {
        const rows = matrix.length;
        const columns = matrix[0].length;
        const transpose = [];
        for (let j = 0; j < columns; j++) {
            const newRow = [];
            for (let i = 0; i < rows; i++) {
                newRow.push(matrix[i][j]);
            }
            transpose.push(newRow);
        }
        return transpose;
    }

    function calculateInverse(matrix) {
        const determinant = calculateDeterminant(matrix);
        if (determinant === 0) throw new Error('Matriks Singular dan Tidak Dapat Di-inverse');

        const n = matrix.length;
        const adjugate = Array.from({ length: n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const minor = matrix
                    .filter((_, row) => row !== i)
                    .map(row => row.filter((_, col) => col !== j));
                adjugate[j][i] = ((i + j) % 2 === 0 ? 1 : -1) * calculateDeterminant(minor);
            }
        }
        return adjugate.map(row => row.map(value => value / determinant));
    }

    function displayMatrix(matrix, resultText) {
        const matrixResult = document.getElementById('matrix-result');
        matrixResult.innerHTML = '';
        const resultHeader = document.createElement('div');
        resultHeader.classList.add('result-header');
        resultHeader.textContent = resultText;
        matrixResult.appendChild(resultHeader);
        matrix.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('matrix-row');
            row.forEach(value => {
                const cell = document.createElement('div');
                cell.classList.add('matrix-cell');
                if (resultText.includes('Inverse')) {
                    cell.textContent = value.toFixed(1);
                } else if (Number.isInteger(value)) {
                    cell.textContent = value;
                } else {
                    cell.textContent = value.toFixed(2);
                }
                rowDiv.appendChild(cell);
            });
            matrixResult.appendChild(rowDiv);
        });
    }
    
    function showMatrixInputForm(operation) {
        mainWrapper.innerHTML = `
            <h2 class="sub-header">${operation} Matrik</h2>
            <div class="operation-note"></div>
            <div class="main-input-wrapper">
                <div class="wrapper-column">
                    <form>
                        <label class="size-label">Matrix Size :</label>
                        <input id="row-input" class="num-input" type="number" min="1" max="8" value="${currentRows}">
                        <span>X</span>
                        <input id="columns-input" class="num-input" type="number" min="1" max="8" value="${currentColumns}">
                    </form>
                    <form id="matrix-form" class="form-input"></form>
                    <button id="calculateBtn" class="calculate-btn">Calculate</button>
                </div>
            </div>
            <div id="matrix-result" class="matrix-result"></div>
            <div class="error"></div>
        `;

        createMatrixInputs(currentRows, currentColumns);

        document.getElementById('row-input').addEventListener('input', (event) => {
            currentRows = parseInt(event.target.value);
            createMatrixInputs(currentRows, currentColumns);
        });

        document.getElementById('columns-input').addEventListener('input', (event) => {
            currentColumns = parseInt(event.target.value);
            createMatrixInputs(currentRows, currentColumns);
        });

        document.getElementById('calculateBtn').addEventListener('click', () => {
            try {
                document.querySelector('.error').textContent = '';
                const rows = currentRows;
                const columns = currentColumns;
                const matrix = getMatrixValues(rows, columns);
                storedMatrix = matrix;
                let result;
                if (operation === 'Determinan') {
                    result = `Determinan: ${calculateDeterminant(matrix)}`;
                    document.getElementById('matrix-result').textContent = result;
                } else if (operation === 'Transpose') {
                    const transpose = calculateTranspose(matrix);
                    displayMatrix(transpose, 'Result:');
                } else if (operation === 'Invers') {
                    const inverse = calculateInverse(matrix);
                    displayMatrix(inverse, 'Inverse:');
                }
            } catch (error) {
                document.querySelector('.error').textContent = error.message;
            }
        });

        setActiveButton(operation);
    }

    function setActiveButton(operation) {
        const buttons = document.querySelectorAll('.nav-btn');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        if (operation === 'Determinan') {
            determinantBtn.classList.add('active');
        } else if (operation === 'Transpose') {
            transposeBtn.classList.add('active');
        } else if (operation === 'Invers') {
            inverseBtn.classList.add('active');
        }
    }

    determinantBtn.addEventListener('click', () => {
        showMatrixInputForm('Determinan');
    });

    transposeBtn.addEventListener('click', () => {
        showMatrixInputForm('Transpose');
    });

    inverseBtn.addEventListener('click', () => {
        showMatrixInputForm('Invers');
    });

    showMatrixInputForm('Determinan');
});
