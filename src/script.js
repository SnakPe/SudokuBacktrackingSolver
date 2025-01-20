/*
    Sudoku Solver
    Copyright (C) 2024  Andreas Kovalski

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
var values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var coords = [0, 1, 2, 3, 4, 5, 6, 7, 8];
var grid = [
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
var pathToSolution = [];
/**
 * Solves a sudoku using backtracking
 *
 * @param grid
 * @returns true if the sudoku was solved, false otherwise
 */
function solve(grid) {
    var nextEmptyCellPosition = undefined;
    outer: for (var _i = 0, coords_1 = coords; _i < coords_1.length; _i++) {
        var y = coords_1[_i];
        for (var _a = 0, coords_2 = coords; _a < coords_2.length; _a++) {
            var x = coords_2[_a];
            if (grid[y][x] == null) {
                nextEmptyCellPosition = { x: x, y: y };
                break outer;
            }
        }
    }
    if (nextEmptyCellPosition == undefined)
        return true;
    for (var _b = 0, values_1 = values; _b < values_1.length; _b++) {
        var value = values_1[_b];
        if (!checkNewValue(grid, value, nextEmptyCellPosition))
            continue;
        var nextGrid = grid.map(function (row) { return row.slice(); });
        nextGrid[nextEmptyCellPosition.y][nextEmptyCellPosition.x] = value;
        pathToSolution.push(nextGrid);
        if (solve(nextGrid))
            return true;
    }
    return false;
}
function getSubgrid(grid, pos) {
    var subgridX = Math.floor(pos.x / 3);
    var subgridY = Math.floor(pos.y / 3);
    var result = [];
    for (var y = subgridY * 3; y < (subgridY + 1) * 3; y++) {
        var subrow = [];
        for (var x = subgridX * 3; x < (subgridX + 1) * 3; x++) {
            subrow.push(grid[y][x]);
        }
        result.push(subrow);
    }
    return result;
}
/**
 * Checks if {@link newValue} can be inserted
 * into the {@link subgrid}
 * at position {@link pos}
 *
 * @param subgrid
 * @param newValue
 * @param pos
 * @returns true is the subgrid rule is not broken, false otherwise
 */
function checkSubgridRule(grid, newValue, pos) {
    var subgrid = getSubgrid(grid, pos);
    var subgridInnerX = pos.x % 3;
    var subgridInnerY = pos.y % 3;
    if (subgrid[subgridInnerY][subgridInnerX] != null)
        return false;
    return !subgrid.flat().includes(newValue);
}
/**
 * Checks if inserting {@link newValue} into {@link grid} works,
 * or if the same column or row already contains the same value
 *
 * @param grid
 * @param newValue the Value
 * @param pos Position where we want to insert {@link newValue}
 */
function checkRowColumnRule(grid, newValue, pos) {
    if (grid[pos.y][pos.x] != null)
        return false;
    if (grid[pos.y].includes(newValue))
        return false;
    for (var y = 0; y < 9; y++)
        if (grid[y][pos.x] == newValue)
            return false;
    return true;
}
/**
 *
 *
 * @param grid
 * @param newValue
 * @param pos
 */
function checkNewValue(grid, newValue, pos) {
    return checkRowColumnRule(grid, newValue, pos) && checkSubgridRule(grid, newValue, pos);
}
/**
 * Gives a DOM representation of a {@link Grid sudoku grid}
 *
 * @param grid
 * @returns
 */
function getSudokuDOM(grid) {
    var sudokuDom = document.createElement("div");
    sudokuDom.id = "Sudoku";
    grid.map(function (row, rowIndex) {
        var rowDom = document.createElement("div");
        rowDom.className = "Row";
        row.map(function (cell, columnIndex) {
            var cellDom = document.createElement("input");
            cellDom.name = "Cell";
            cellDom.type = "number";
            cellDom.max = "9";
            cellDom.min = "1";
            cellDom.maxLength = 1;
            cellDom.className = "Cell";
            //cellDom.contentEditable = "true"
            cellDom.value = cell == null ? " " : cell.toString();
            rowDom.appendChild(cellDom);
        });
        sudokuDom.appendChild(rowDom);
    });
    return sudokuDom;
}
onload = function () {
    var solveButton = document.getElementById("SudokuSolver");
    var sudoku = document.getElementById("Sudoku");
    var slider = document.getElementById("SolutionIteratorSelector");
    sudoku.replaceChildren.apply(sudoku, getSudokuDOM(grid).childNodes.values());
    solveButton.addEventListener("click", function () {
        pathToSolution = [];
        var rowIndex = 0;
        var columnIndex = 0;
        sudoku.childNodes.forEach(function (row) {
            row.childNodes.forEach(function (cell) {
                var cell2 = cell;
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
        var _this = this;
        sudoku.childNodes.forEach(function (row, rowIndex) {
            row.childNodes.forEach(function (cell, columnIndex) {
                var currentCell = pathToSolution[Number(_this.value)][rowIndex][columnIndex];
                cell.value = currentCell == null ? "" : currentCell.toString();
            });
        });
    }
    slider.addEventListener("change", handleSliderChange);
};
function goThrough(timeInMillis) {
    var i = 0;
    var intervalID = 0;
    function showNext() {
        var _a;
        if (i >= pathToSolution.length) {
            clearInterval(intervalID);
            return;
        }
        (_a = document.getElementById("Sudoku")) === null || _a === void 0 ? void 0 : _a.replaceChildren.apply(_a, getSudokuDOM(pathToSolution[i]).childNodes.values());
        i++;
    }
    intervalID = setInterval(function () { return showNext(); }, timeInMillis);
}
