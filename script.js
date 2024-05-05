$(document).ready(function() {
    // Initialize sortable and button visibility checks on document ready
    initSortable();
    checkButtons();

    // Add block after
    $(document).on('click', '.add-block-after', function() {
        addTimeBlockAfter();
    });

    // Add block before
    $(document).on('click', '.add-block-before', function() {
        addTimeBlockBefore();
    });

    // Handle task status change
    $(document).on('click', 'button.status-btn', function() {
        const status = $(this).data('status');
        markStatus(this, status);
    });
});

function initSortable() {
    // Make sure this code only applies to existing time blocks
    $(".time-block").sortable({
        connectWith: ".time-block",
        items: ".task",
        placeholder: "task-placeholder"
    }).disableSelection();
}

function addTimeBlockAfter() {
    let lastTime = $('.time-block:last').find('h3').text();
    if (lastTime == "") {
        createTimeBlock("8:00 - 8:45");
    } else {
        const nextTime = getNextTimeRange(lastTime);
        if (nextTime !== "") {
            createTimeBlock(nextTime);
        } else {
            console.log("Sanity check, this means that that we are on 23:00-23:45")
        }
    }
    checkButtons();
}

function addTimeBlockBefore() {
    let firstTime = $('.time-block:first').find('h3').text();
    const prevTime = getPrevTimeRange(firstTime);
    if (prevTime !== "") {
        createTimeBlock(prevTime, true);
    } else if (!firstTime) {
        createTimeBlock("8:00 - 8:45", true);
    }
    checkButtons();
}

// Include implementations for getNextTimeRange, getPrevTimeRange, createTimeBlock, markStatus, checkButtons

function checkButtons() {
    const firstTime = $('.time-block:first').find('h3').text();
    const lastTime = $('.time-block:last').find('h3').text();
    if (firstTime === "0:00 - 0:45") {
        $('button[onclick="addTimeBlockBefore()"]').hide();
    } else {
        $('button[onclick="addTimeBlockBefore()"]').show();
    }
    if (lastTime === "23:00 - 23:45") {
        $('button[onclick="addTimeBlockAfter()"]').hide();
    } else {
        $('button[onclick="addTimeBlockAfter()"]').show();
    }
}

function getNextTimeRange(currentRange) {
    let [start, end] = currentRange.split(' - ');
    start = getNextHour(start);
    end = getNextHour(end);
    if (start === "24:00") return "";
    return `${start} - ${end}`;
}

function getPrevTimeRange(currentRange) {
    let [start, end] = currentRange.split(' - ');
    start = getPrevHour(start);
    end = getPrevHour(end);
    if (start === "-1:00") return "";
    return `${start} - ${end}`;
}

function getNextHour(time) {
    let [hour, min] = time.split(':');
    hour = parseInt(hour) + 1;
    if (hour === 24) return "24:00";
    return `${hour.toString().padStart(2, '0')}:${min}`;
}

function getPrevHour(time) {
    let [hour, min] = time.split(':');
    hour = parseInt(hour) - 1;
    if (hour === -1) return "-1:00";
    return `${hour.toString().padStart(2, '0')}:${min}`;
}

function createTimeBlock(time, prepend = false) {
    const blockHTML = `<div class="time-block">
        <div class="header">
            <h3>${time}</h3>
            <button onclick="addTask(this)">Add Task</button>
        </div>
    </div>`;
    if (prepend) {
        $('.schedule').prepend(blockHTML);
    } else {
        $('.schedule').append(blockHTML);
    }
    $(".time-block").sortable({
        connectWith: ".time-block",
        items: ".task",
        placeholder: "task-placeholder"
    }).disableSelection();
}

function addTask(element) {
    const block = $(element).closest('.time-block');
    block.append('<div class="task" draggable="true"><input type="text" value="New Task" class="task-name"><button onclick="deleteTask(this)">Delete</button><button onclick="markStatus(this, \'completed\')">✓</button><button onclick="markStatus(this, \'inProgress\')">⏳</button><button onclick="markStatus(this, \'unfinished\')">✗</button></div>');
}

function deleteTask(element) {
    const block = $(element).closest('.time-block');
    $(element).parent().remove();
}

function markStatus(element, status) {
    const task = $(element).parent();
    task.removeClass('completed inProgress unfinished').addClass(status);
}

