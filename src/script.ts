/*
    Sudoku Solver
    Copyright (C) 2024 Andreas Kovalski

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

type Value = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
const values : Value[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
type Cell = Value | null

type Row = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell]
type Subgrid = [
    [Cell, Cell, Cell], 
    [Cell, Cell, Cell], 
    [Cell, Cell, Cell]
]
type Grid = [Row, Row, Row, Row, Row, Row, Row, Row, Row] 

type Coordinate = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 
const coords : Coordinate[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]
type Position = {x : Coordinate, y : Coordinate}

const grid : Grid = [
    [5   ,3   ,null,null,7   ,null,null,null,null],
    [6   ,null,null,1   ,9   ,5   ,null,null,null],
    [null,9   ,8   ,null,null,null,null,6   ,null],
    [8   ,null,null,null,6   ,null,null,null,3   ],
    [4   ,null,null,8   ,null,3   ,null,null,1   ],
    [7   ,null,null,null,2   ,null,null,null,6   ],
    [null,6   ,null,null,null,null,2   ,8   ,null],
    [null,null,null,4   ,1   ,9   ,null,null,5   ],
    [null,null,null,null,8   ,null,null,7   ,9   ]
]
let pathToSolution : Grid[] = []

/**
 * Solves a sudoku using backtracking
 * 
 * @param grid 
 * @returns true if the sudoku was solved, false otherwise
 */
function solve(grid : Grid) : boolean{
    let nextEmptyCellPosition : Position | undefined = undefined

    //initialize list of all empty cells
    outer : for(const y of coords){
        for(const x of coords){
            if(grid[y][x] == null){
                nextEmptyCellPosition = {x : x, y : y}
                break outer
            }
        }
    }

    if(nextEmptyCellPosition == undefined)return true
    pathToSolution.push(grid)
    for(const value of values){
        if(!checkNewValue(grid,value,nextEmptyCellPosition))continue

        const nextGrid = grid.map(row => row.slice()) as Grid
        nextGrid[nextEmptyCellPosition.y][nextEmptyCellPosition.x] = value

        pathToSolution.push(nextGrid)
        if(solve(nextGrid))return true
    }
    return false
}

function getSubgrid(grid : Grid, pos : Position) : Subgrid{
    const subgridX = Math.floor(pos.x/3)
    const subgridY = Math.floor(pos.y/3)
    const result = []
    for(let y = subgridY*3;y < (subgridY+1)*3;y++){
        const subrow : Cell[] = []
        for(let x = subgridX*3;x < (subgridX+1)*3; x++){
            subrow.push(grid[y][x])
        }
        result.push(subrow)
    }

    return result as Subgrid
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
function checkSubgridRule(grid : Grid, newValue : Value, pos : Position) : boolean{
    const subgrid = getSubgrid(grid, pos)
    const subgridInnerX = pos.x%3 as 0 | 1 | 2
    const subgridInnerY = pos.y%3 as 0 | 1 | 2

    if(subgrid[subgridInnerY][subgridInnerX] != null)return false
    return !subgrid.flat().includes(newValue)
}

/**
 * Checks if inserting {@link newValue} into {@link grid} works, 
 * or if the same column or row already contains the same value 
 * 
 * @param grid 
 * @param newValue the Value
 * @param pos Position where we want to insert {@link newValue}  
 */
function checkRowColumnRule(grid : Grid, newValue : Value, pos : Position){
    if(grid[pos.y][pos.x] != null)return false
    if(grid[pos.y].includes(newValue))return false
    for(let y = 0; y < 9; y++)
        if(grid[y][pos.x] == newValue)return false
    return true
}

/**
 * 
 * 
 * @param grid 
 * @param newValue 
 * @param pos 
 */
function checkNewValue(grid:Grid, newValue : Value, pos : Position) : boolean{
    return checkRowColumnRule(grid, newValue, pos) && checkSubgridRule(grid, newValue, pos)
}

/**
 * Gives a DOM representation of a {@link Grid sudoku grid}
 * 
 * @param grid 
 * @returns 
 */
function getSudokuDOM(grid : Grid) : HTMLDivElement{
    const sudokuDom = document.createElement("div")
    sudokuDom.id = "Sudoku"
    grid.map((row,rowIndex) => {
        const rowDom = document.createElement("div")
        rowDom.className = "Row"
        row.map((cell, columnIndex) => {
            const cellDom = document.createElement("input")
            cellDom.name = "Cell"
            cellDom.type = "number"
            cellDom.max = "9"
            cellDom.min = "1"
            cellDom.maxLength = 1
            cellDom.className = "Cell"
            //cellDom.contentEditable = "true"
            cellDom.value = cell == null ? " " : cell.toString()

            rowDom.appendChild(cellDom)
        })
        sudokuDom.appendChild(rowDom)
    })
    return sudokuDom
}
onload = () => {
    const solveButton = document.getElementById("SudokuSolver")!
    const sudoku = document.getElementById("Sudoku")! 
    const slider = document.getElementById("SolutionIteratorSelector")! as HTMLInputElement
    sudoku.replaceChildren(...getSudokuDOM(grid).childNodes.values())
    

    let intervalID = 0
    function handleAnimation(){
        let i = 0
        clearInterval(intervalID)
        function showNext(){
            if(i >= pathToSolution.length){
                clearInterval(intervalID)
                return
            }
            showSudokuOfPath(i)
            i++
        }
        const timeInMillis = (document.getElementById("AnimationSpeedSelector")! as HTMLInputElement).valueAsNumber
        intervalID = setInterval(() => showNext(),timeInMillis)
    }
    document.getElementById("SolveAnimator")!.addEventListener("click", () => handleAnimation())
    document.getElementById("AnimationStoper")!.addEventListener("click", () => clearInterval(intervalID))


    function handleSolve(){
        clearInterval(intervalID)
        pathToSolution = []
        let rowIndex = 0
        let columnIndex = 0
        sudoku.childNodes.forEach((row) => {
            row.childNodes.forEach((cell) => {
                const cell2 = cell as HTMLInputElement
                grid[rowIndex][columnIndex] = cell2.value.replaceAll(" ","") == "" ? null : Number(cell2.value) as Cell
                columnIndex++
            })
            columnIndex = 0
            rowIndex++
        })
        if(!solve(grid))alert("Sudoku is not solvable")
        slider.max = (pathToSolution.length-1).toString()
        showSudokuOfPath(0)
    }
    solveButton.addEventListener("click",() => handleSolve());

    function showSudokuOfPath(iteration : number){
        sudoku.childNodes.forEach((row,rowIndex) => {
            row.childNodes.forEach((cell, columnIndex) => {
                let currentCell : Cell = pathToSolution[iteration][rowIndex][columnIndex];
                (cell as HTMLInputElement).value = currentCell == null ? "" : currentCell.toString() 
            })
        })
    }
    function handleSliderChange(this: HTMLInputElement, e : Event){
        showSudokuOfPath(Number(this.value))
    }
    slider.addEventListener("change", handleSliderChange)
}


