"use strict";
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const coords = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const grid = [
    [5, 3, null, null, 7, null, null, null, null],
    [6, null, null, 1, 9, 5, null, null, null],
    [null, 9, 8, null, null, null, null, 6, null],
    [8, null, null, null, 6, null, null, null, 3],
    [4, null, null, 8, null, 3, null, null, 1],
    [7, null, null, null, 2, null, null, null, 6],
    [null, 6, null, null, null, null, 2, 8, null],
    [null, null, null, 4, 1, 9, null, null, 5],
    [null, null, null, null, 8, null, null, 7, 9]
];
let pathToSolution = [];
function solve(grid) {
    let nextEmptyCellPosition = undefined;
    outer: for (const y of coords) {
        for (const x of coords) {
            if (grid[y][x] == null) {
                nextEmptyCellPosition = { x: x, y: y };
                break outer;
            }
        }
    }
    if (nextEmptyCellPosition == undefined)
        return true;
    for (const value of values) {
        if (!checkNewValue(grid, value, nextEmptyCellPosition))
            continue;
        const nextGrid = grid.map(row => row.slice());
        nextGrid[nextEmptyCellPosition.y][nextEmptyCellPosition.x] = value;
        pathToSolution.push(nextGrid);
        if (solve(nextGrid))
            return true;
    }
    return false;
}
function getSubgrid(grid, pos) {
    const subgridX = Math.floor(pos.x / 3);
    const subgridY = Math.floor(pos.y / 3);
    const result = [];
    for (let y = subgridY * 3; y < (subgridY + 1) * 3; y++) {
        const subrow = [];
        for (let x = subgridX * 3; x < (subgridX + 1) * 3; x++) {
            subrow.push(grid[y][x]);
        }
        result.push(subrow);
    }
    return result;
}
function checkSubgridRule(grid, newValue, pos) {
    const subgrid = getSubgrid(grid, pos);
    const subgridInnerX = pos.x % 3;
    const subgridInnerY = pos.y % 3;
    if (subgrid[subgridInnerY][subgridInnerX] != null)
        return false;
    return !subgrid.flat().includes(newValue);
}
function checkRowColumnRule(grid, newValue, pos) {
    if (grid[pos.y][pos.x] != null)
        return false;
    if (grid[pos.y].includes(newValue))
        return false;
    for (let y = 0; y < 9; y++)
        if (grid[y][pos.x] == newValue)
            return false;
    return true;
}
function checkNewValue(grid, newValue, pos) {
    return checkRowColumnRule(grid, newValue, pos) && checkSubgridRule(grid, newValue, pos);
}
function getSudokuDOM(grid) {
    const sudokuDom = document.createElement("div");
    sudokuDom.id = "Sudoku";
    grid.map((row, rowIndex) => {
        const rowDom = document.createElement("div");
        rowDom.className = "Row";
        row.map((cell, columnIndex) => {
            const cellDom = document.createElement("input");
            cellDom.type = "number";
            cellDom.max = "9";
            cellDom.min = "1";
            cellDom.maxLength = 1;
            cellDom.className = "Cell";
            cellDom.value = cell == null ? " " : cell.toString();
            rowDom.appendChild(cellDom);
        });
        sudokuDom.appendChild(rowDom);
    });
    return sudokuDom;
}
onload = () => {
    const solveButton = document.getElementById("SudokuSolver");
    const sudoku = document.getElementById("Sudoku");
    const slider = document.getElementById("SolutionIteratorSelector");
    sudoku.replaceChildren(...getSudokuDOM(grid).childNodes.values());
    solveButton.addEventListener("click", () => {
        pathToSolution = [];
        let rowIndex = 0;
        let columnIndex = 0;
        sudoku.childNodes.forEach((row) => {
            row.childNodes.forEach((cell) => {
                const cell2 = cell;
                grid[rowIndex][columnIndex] = cell2.value.replaceAll(" ", "") == "" ? null : Number(cell2.value);
                columnIndex++;
            });
            columnIndex = 0;
            rowIndex++;
        });
        solve(grid);
        slider.max = (pathToSolution.length - 1).toString();
    });
    function handleSliderChange(e) {
        sudoku.replaceChildren(...getSudokuDOM(pathToSolution[Number(this.value)]).childNodes.values());
    }
    slider.addEventListener("change", handleSliderChange);
};
function goThrough(timeInMillis) {
    let i = 0;
    let intervalID = 0;
    function showNext() {
        if (i >= pathToSolution.length) {
            clearInterval(intervalID);
            return;
        }
        document.getElementById("Sudoku")?.replaceChildren(...getSudokuDOM(pathToSolution[i]).childNodes.values());
        i++;
    }
    intervalID = setInterval(() => showNext(), timeInMillis);
}
