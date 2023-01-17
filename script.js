const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var block_size = 70
const constant_width = 8
const constant_height = 8
var width = constant_width
var height = constant_height
var player_y = 0
var player_x = 0
var win = false
var movable = false
canvas.width = width * block_size;
canvas.height = height * block_size;
canvas.style.border = '2px solid #000';

var distance_weight = 1.2;
var step_count_weight = -1.2;
var valid_steps_weight = 0.3;

var distance_weight_test = distance_weight;
var step_count_weight_test = step_count_weight;
var valid_steps_weight_test = valid_steps_weight;

var step_decrease_point = 0.2;
var two_steps_decrease_point = 0.4;
var win_prize = 5
var movable_decrease = -5
//var two_steps_decrease_point = 0.2;

var valid_neighbours_steps_weight = 0.05;
var learning_rate = 0.5;
var points = 10;
var last_point;

const max_distance = Math.sqrt(constant_height * constant_height + constant_width * constant_width)

function one_step_vertical(start_x, start_y, stop_x, stop_y, row) {
    let range_x = 0
    let range_y = 0
    let random_hole = Math.floor(Math.random() * ((stop_y - range_y) - (start_y + range_y)) + (start_y + range_y));
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(row * block_size, start_y * block_size);
    ctx.lineTo(row * block_size, stop_y * block_size);
    for (var i = 0; i < 100; i++) ctx.stroke();
    for (var i = start_y; i < stop_y; i++) labirint[i][row][1] = 1;
    labirint[random_hole][row][1] = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(row * block_size, random_hole * block_size);
    ctx.lineTo(row * block_size, (random_hole + 1) * block_size);
    for (var i = 0; i < 100; i++) ctx.stroke();
}


function sigmoid(number) {
    return 1 / (1 + Math.exp(-number));
  }


function one_step_horizontal(start_x, start_y, stop_x, stop_y, column) {
    let range_x = 0
    let range_y = 0
    let random_hole = Math.floor(Math.random() * ((stop_x - range_x) - (start_x + range_x)) + (start_x + range_x));
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(start_x * block_size, column * block_size);
    ctx.lineTo(stop_x * block_size, column * block_size);
    for (var i = 0; i < 100; i++) ctx.stroke();
    for (var i = start_x; i < stop_x; i++) labirint[column][i][0] = 1;
    labirint[column][random_hole][0] = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(random_hole * block_size, column * block_size);
    ctx.lineTo((random_hole + 1) * block_size, column * block_size);
    for (var i = 0; i < 100; i++) ctx.stroke();
}

function create_labirint_matrix() {
    for (let i = 0; i < constant_height; i++) {
        height_element = []
        for (let j = 0; j < constant_width; j++) {
            height_element[j] = [0, 0, 0];
        }
        labirint[i] = height_element
    }
    labirint[player_y][player_x][2] = 1
}

function one_step(start_x, start_y, stop_x, stop_y, index) {
    width = stop_x - start_x
    height = stop_y - start_y
    if (width < height) {
        one_step_horizontal(start_x, start_y, stop_x, stop_y, index);
    }
    else if (width > height) {
        one_step_vertical(start_x, start_y, stop_x, stop_y, index);
    }
    else {
        Math.random() > 0.5 ? one_step_horizontal(start_x, start_y, stop_x, stop_y, index) : one_step_vertical(start_x, start_y, stop_x, stop_y, index);
    }

}
function recursive_step(start_x, start_y, stop_x, stop_y) {
    let width = stop_x - start_x
    let height = stop_y - start_y
    let range = 1
    let ori = "h"
    let index = Math.floor(Math.random() * ((stop_y - range) - (start_y + range)) + (start_y + range));
    if (width >= height) {
        ori = "v"
        index = Math.floor(Math.random() * ((stop_x - range) - (start_x + range)) + (start_x + range));
    }
    if (width <= 2 || height <= 2) {
        return 0
    }
    one_step(start_x, start_y, stop_x, stop_y, index);
    if (ori == "h") {
        recursive_step(start_x, start_y, stop_x, index)
        recursive_step(start_x, index, stop_x, stop_y)
    }
    else {
        recursive_step(start_x, start_y, index, stop_y)
        recursive_step(index, start_y, stop_x, stop_y)
    }
    return 0;
}


function draw_round(y, x, radius, steps) {
    ctx.beginPath();
    if (steps == 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#cccccc';
    }
    if (steps == 1) {
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffa500';
    }
    if (steps == 2) {
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ff0000';
    }
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill()
    for (var i = 0; i < 100; i++) ctx.stroke();
}

function update_steps() {
    for (let y = 0; y < constant_height; y++) {
        for (let x = 0; x < constant_width; x++) {
            draw_round(y * block_size + block_size / 2, x * block_size + block_size / 2, block_size / 5, labirint[y][x][2])
        }
    }
}
function update_player() {
    ctx.beginPath();
    ctx.arc(player_x * block_size + (block_size / 2), player_y * block_size + (block_size / 2), block_size / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#00e390';
    ctx.fill()
    for (var i = 0; i < 100; i++) ctx.stroke();
}
function clear_player() {
    ctx.beginPath();
    ctx.arc(player_x * block_size + (block_size / 2), player_y * block_size + (block_size / 2), block_size / 3, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.fill()
    for (var i = 0; i < 100; i++) ctx.stroke();
}

function move_player(coordinates) {
    
    if (labirint[coordinates[0]][coordinates[1]][2] == 1) { 
        points -= two_steps_decrease_point
    }
    points -= step_decrease_point
    new_y = coordinates[0]
    new_x = coordinates[1]
    clear_player()
    player_x = new_x
    player_y = new_y
    update_steps()
    update_player()
    labirint[player_y][player_x][2] = labirint[player_y][player_x][2] + 1
}

function update_weight_info() {
    let a = document.getElementById("dw")
    let b = document.getElementById("scw")
    let c = document.getElementById("vsw")
    let d = document.getElementById("pi")
    a.textContent = distance_weight.toString()
    b.textContent = step_count_weight.toString()
    c.textContent = valid_steps_weight.toString()
    d.textContent = points.toString()
}


function find_distance_to_exit(coord) {
    let y = coord[0]
    let x = coord[1]
    let old_value = (Math.sqrt((constant_height - y) * (constant_height - y) + (constant_width - x) * (constant_width - x)))
    let new_value = ((old_value - 0) / (max_distance - 0)) * (10 - 0) + 0
    return 10 - new_value
}

function step_count_range_changer(coord) {
    let new_value = ((labirint[coord[0]][coord[1]][2] - 0) / (2 - 0)) * (10 - 0) + 0
    return new_value
}

function calculate_points(coord, distance_weight, step_count_weight, valid_steps_weight) {
    update_test_weights()
    let points = 0
    points += distance_weight * find_distance_to_exit(coord)
    points += step_count_weight * step_count_range_changer(coord)
    points += valid_steps_weight * find_valid_steps_rate(coord)
    //points += valid_neighbours_steps_weight * find_valid_neighbours_steps_rate(coord)
    return sigmoid(points)
}

function find_valid_neighbours_steps_rate(coord) {
    let old_value = 0
    let all_moves = []
    let valid_moves = []
    all_moves.push([coord[0] - 1, coord[1]])
    all_moves.push([coord[0] + 1, coord[1]])
    all_moves.push([coord[0], coord[1] - 1])
    all_moves.push([coord[0], coord[1] + 1])
    for (let i = 0; i < all_moves.length; i++) {
        if (all_moves[i][0] < 0) {
            continue
        }
        if (all_moves[i][1] < 0) {
            continue
        }
        if (all_moves[i][0] >= (constant_height - 1)) {
            continue
        }
        if (all_moves[i][1] >= (constant_width - 1)) {
            continue
        }
        if (all_moves[i][0] < coord[0] && labirint[coord[0]][coord[1]][0] == 1) {
            continue
        }
        if (all_moves[i][1] < coord[1] && labirint[coord[0]][coord[1]][1] == 1) {
            continue
        }
        if (all_moves[i][0] > coord[0] && labirint[coord[0] + 1][coord[1]][0] == 1) {
            continue
        }
        if (all_moves[i][1] > coord[1] && labirint[coord[0]][coord[1] + 1][1] == 1) {
            continue
        }
        if (labirint[all_moves[i][0]][all_moves[i][1]][2] >= 2) {
            continue
        }
        valid_moves.push(all_moves[i])
    }
    for (let i = 0; i < valid_moves.length; i++) {
        old_value += find_valid_steps_rate([valid_moves[i][0], valid_moves[i][1]])
    }
    new_value = ((old_value - 0) / (40 - 0)) * (10 - 0) + 0
    return new_value
}

function find_valid_steps_rate(coord) {
    let all_moves = []
    let valid_moves = []
    all_moves.push([coord[0] - 1, coord[1]])
    all_moves.push([coord[0] + 1, coord[1]])
    all_moves.push([coord[0], coord[1] - 1])
    all_moves.push([coord[0], coord[1] + 1])
    for (let i = 0; i < all_moves.length; i++) {
        if (all_moves[i][0] < 0) {
            continue
        }
        if (all_moves[i][1] < 0) {
            continue
        }
        if (all_moves[i][0] >= (constant_height - 1)) {
            continue
        }
        if (all_moves[i][1] >= (constant_width - 1)) {
            continue
        }
        if (all_moves[i][0] < coord[0] && labirint[coord[0]][coord[1]][0] == 1) {
            continue
        }
        if (all_moves[i][1] < coord[1] && labirint[coord[0]][coord[1]][1] == 1) {
            continue
        }
        if (all_moves[i][0] > coord[0] && labirint[coord[0] + 1][coord[1]][0] == 1) {
            continue
        }
        if (all_moves[i][1] > coord[1] && labirint[coord[0]][coord[1] + 1][1] == 1) {
            continue
        }

        if (labirint[all_moves[i][0]][all_moves[i][1]][2] >= 2) {
            continue
        }
        valid_moves.push(all_moves[i])
    }
    new_value = ((valid_moves.length - 0) / (4 - 0)) * (10 - 0) + 0

    return new_value
}

function find_best_move() {
    let all_moves = []
    let valid_moves = []
    let moves_scores = []
    all_moves.push([player_y - 1, player_x])
    all_moves.push([player_y + 1, player_x])
    all_moves.push([player_y, player_x - 1])
    all_moves.push([player_y, player_x + 1])
    for (let i = 0; i < all_moves.length; i++) {
        if (all_moves[i][0] < 0) {
            continue
        }
        if (all_moves[i][1] < 0) {
            continue
        }
        if (all_moves[i][0] >= constant_height) {
            continue
        }
        if (all_moves[i][1] >= constant_width) {
            continue
        }
        if (all_moves[i][0] < player_y && labirint[player_y][player_x][0] == 1) {
            continue
        }
        if (all_moves[i][1] < player_x && labirint[player_y][player_x][1] == 1) {
            continue
        }
        if (all_moves[i][0] > player_y && labirint[player_y + 1][player_x][0] == 1) {
            continue
        }
        if (all_moves[i][1] > player_x && labirint[player_y][player_x + 1][1] == 1) {
            continue
        }
        if (labirint[all_moves[i][0]][all_moves[i][1]][2] >= 2) {
            continue
        }
        valid_moves.push(all_moves[i])
    }

    if (valid_moves.length == 1) {
        return valid_moves[0]
    }
    for (let i = 0; i < valid_moves.length; i++) {
        moves_scores[i] = 0
    }
    for (let i = 0; i < valid_moves.length; i++) {
        moves_scores[i] = calculate_points(valid_moves[i], distance_weight_test, step_count_weight_test, valid_steps_weight_test)
    }
    let best_move = valid_moves[moves_scores.indexOf(Math.max.apply(0, moves_scores))]
    return best_move;

}

function reset_labirint() {
    points = 10
    clear_player()
    player_x = 0
    player_y = 0
    for (let i = 0; i < constant_height; i++) {
        height_element = []
        for (let j = 0; j < constant_width; j++) {
            labirint[i][j][2] = 0
        }
    }
    update_steps()

    move_player([0, 0])
    labirint[player_y][player_x][2] = 1
}

function find_two_steps() {
    let count = 0
    for (let i = 0; i < constant_height; i++) {
        height_element = []
        for (let j = 0; j < constant_width; j++) {
            if (labirint[i][j][2] == 2) {
                count += 1
            }
        }
    }
    return count
    update_steps()

    move_player([0, 0])
    labirint[player_y][player_x][2] = 1
}

function check_win() {
    if (player_x == constant_width - 1 && player_y == constant_height - 1) {
        win = true
        return true
    }
    win = false
    return false;
}

function check_movable() {
    if (find_best_move() == undefined) {
        movable = false
        return false
    }
    movable = true
    return true;
}

var labirint = []
function new_labirint(params) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    labirint = []
    player_x = 0
    player_y = 0
    win = false
    var a = 0;
    function generate_labirint() {
        create_labirint_matrix()
        let start_x = 0
        let start_y = 0
        let stop_x = constant_width
        let stop_y = constant_height
        recursive_step(start_x, start_y, stop_x, stop_y)
    }
    generate_labirint();
    update_steps()
    update_player()
}

new_labirint()

function new_labirint_button() {
    new_labirint()
}

function update_test_weights() {
    distance_weight_test = distance_weight
    step_count_weight_test = step_count_weight
}

function one_step_button() {
    check_win()
    if (!win && check_movable()) {
        move_player(find_best_move())
    }
    update_weight_info()
    if (check_win()){
        points += win_prize;
    }
    if ( !check_movable()){
        points += movable_decrease;
    }
}

function one_try_button() {
    while (check_win() == false && check_movable() == true) {

        if (!win) {
            move_player(find_best_move())
        }

    }
    if (check_win()){
        points += win_prize;
    }
    if ( !check_movable()){
        points += movable_decrease;
    }
    update_weight_info()

}

function learn_button() {
    reset_labirint()
    one_try_button()
    last_point = points
    let results = []
    distance_weight_test = distance_weight + learning_rate
    step_count_weight_test = step_count_weight + learning_rate
    reset_labirint()
    one_try_button()
    results[0] = -90000
    results[1] = points

    distance_weight_test = distance_weight - learning_rate
    step_count_weight_test = step_count_weight - learning_rate
    reset_labirint()
    one_try_button()
    results[2] = points

    distance_weight_test = distance_weight - learning_rate
    step_count_weight_test = step_count_weight + learning_rate
    reset_labirint()
    one_try_button()
    results[3] = points

    distance_weight_test = distance_weight + learning_rate
    step_count_weight_test = step_count_weight - learning_rate
    reset_labirint()
    one_try_button()
    results[4] = points
    console.log(results);

    let best_choice = results.indexOf(Math.max.apply(0, results))
    if (best_choice == 0) {
    }
    else if (best_choice == 1) {
        distance_weight = distance_weight + learning_rate
        step_count_weight = step_count_weight + learning_rate
    }
    else if (best_choice == 2) {
        distance_weight = distance_weight - learning_rate
        step_count_weight = step_count_weight - learning_rate
    }
    else if (best_choice == 3) {
        distance_weight = distance_weight - learning_rate
        step_count_weight = step_count_weight + learning_rate
    }
    else if (best_choice == 4) {
        distance_weight = distance_weight + learning_rate
        step_count_weight = step_count_weight - learning_rate
    }
    reset_labirint()
    one_try_button()
    last_point = points 
    
}