$(document).ready(function() {
    // Initialize sortable and button visibility checks on document ready
    loadSchedule();
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

    $(document).on('click', '.delete-task', function() {
        const taskElement = $(this).closest('.task');
        taskElement.remove(); // Remove the task element from the DOM
        console.log("hi"); // This should now log in the console
        saveSchedule(); // Update the schedule after deleting the task
    });

});

function initSortable() {
    // Make sure this code only applies to existing time blocks
    $(".time-block").sortable({
        connectWith: ".time-block",
        items: ".task",
        placeholder: "task-placeholder",
        stop: function(event, ui) {
            // This event triggers when the dragging stops and the item is dropped
            saveSchedule(); // Call the save function here
        }
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



function addTaskToBlock(time, taskName, status) {
    let block = $('.time-block').filter(function() { return $(this).find('h3').text() === time; });
    let taskHtml = `<div class="task ${status}" draggable="true">
                        <input type="text" value="${taskName}" class="task-name">
                        <button class="delete-task">Delete</button>
                        <button class="status-btn" data-status="completed">✓</button>
                        <button class="status-btn" data-status="inProgress">⏳</button>
                        <button class="status-btn" data-status="unfinished">✗</button>
                    </div>`;
    block.append(taskHtml);
    saveSchedule();
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
    saveSchedule();
}

function addTask(element) {
    const block = $(element).closest('.time-block');
    block.append('<div class="task" draggable="true"><input type="text" value="" class="task-name"><button onclick="deleteTask(this)" class=".delete-task">Delete</button><button onclick="markStatus(this, \'completed\')">✓</button><button onclick="markStatus(this, \'inProgress\')">⏳</button><button onclick="markStatus(this, \'unfinished\')">✗</button></div>');
    saveSchedule();
}

function deleteTask(element) {
    const block = $(element).closest('.time-block');
    $(element).parent().remove();
    console.log("hi")
    saveSchedule();
}

function markStatus(element, status) {
    const task = $(element).parent();
    // Check if the task already has the specified status
    if (task.hasClass(status)) {
        // If the task already has the status, remove it
        task.removeClass(status);
    } else {
        // Otherwise, remove all potential status classes and add the new one
        task.removeClass('completed inProgress unfinished').addClass(status);
    }
    saveSchedule(); // Save changes to local storage
}

function saveSchedule() {
    let tasks = [];
    $('.time-block').each(function() {
        let timeRange = $(this).find('h3').text();
        let taskData = $(this).find('.task').map(function() {
            // Fetch all classes and filter out the 'task' class and potentially other non-status classes
            let allClasses = $(this).attr('class').split(' ');
            let status = allClasses.filter(cls => cls !== 'task' && cls !== 'otherNonStatusClass').join(' '); // Adjust based on your actual CSS
            return {
                name: $(this).find('.task-name').val(),
                status: status // Now stores any remaining classes that could be statuses
            };
        }).get();
        tasks.push({ time: timeRange, tasks: taskData });
    });
    localStorage.setItem('taskScheduler', JSON.stringify(tasks));
}

function loadSchedule() {
    let storedTasks = localStorage.getItem('taskScheduler');
    if (storedTasks) {
        storedTasks = JSON.parse(storedTasks);
        storedTasks.forEach(block => {
            createTimeBlock(block.time, false);
            block.tasks.forEach(task => {
                addTaskToBlock(block.time, task.name, task.status);
            });
        });
    }
}


function stopSounds() {
    document.getElementById('startSound').pause();
    document.getElementById('startSound').currentTime = 0; // Reset playback position
    document.getElementById('endSound').pause();
    document.getElementById('endSound').currentTime = 0; // Reset playback position
}

function checkAndPlaySound() {
    console.log("sound")
    const currentTime = new Date(); // Get the current date and time
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    $('.time-block').each(function() {
        const timeRange = $(this).find('h3').text(); // e.g., "8:00 - 8:45"
        const [startTime, endTime] = timeRange.split(' - ');
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        // Play start sound at the beginning of a time block
        if (currentHours === startHour && currentMinutes === startMinute) {
            document.getElementById('startSound').play();
        }

        // Play end sound at the end of a time block
        if (currentHours === endHour && currentMinutes === endMinute) {
            document.getElementById('endSound').play();
        }
    });
}

// Set this function to run every minute
setInterval(checkAndPlaySound, 60000); // 60000 milliseconds = 1 minute
