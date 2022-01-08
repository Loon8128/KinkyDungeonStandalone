/**
 * Main game running state, runs the drawing
 * @param {number} Timestamp
 */
function MainRun(Timestamp) {
    DrawProcess(Timestamp);
    TimerProcess(Timestamp);
}

/**
 * When the user presses a key, we send the KeyDown event to the current screen if it can accept it
 * @param {KeyboardEvent} event
 */
function KeyDown(event) {
    if (event.repeat) return;
    KeyPress = event.keyCode || event.which;
    CommonKeyDown(event);
}

/**
 * Handler for document-wide keydown event
 * @param {KeyboardEvent} event
 */
function DocumentKeyDown(event) {
    if (event.repeat) return;
    if (event.key == "Escape") {
        if (CurrentScreenFunctions.Exit) {
            CurrentScreenFunctions.Exit();
        } else if ((CurrentCharacter != null) && Array.isArray(DialogMenuButton) && (DialogMenuButton.indexOf("Exit") >= 0)) {
            if (!DialogLeaveFocusItem())
                DialogLeaveItemMenu();
        } else if ((CurrentCharacter != null) && (CurrentScreen == "ChatRoom")) {
            DialogLeave();
        } else if ((CurrentCharacter == null) && (CurrentScreen == "ChatRoom") && (document.getElementById("TextAreaChatLog") != null)) {
            ElementScrollToEnd("TextAreaChatLog");
        }
    } else if (event.key == "Tab") {
        KeyDown(event);
    }
}

/**
 * When the user clicks, we fire the click event for other screens
 * @param {MouseEvent} event
 */
function Click(event) {
    if (!CommonIsMobile) {
        MouseMove(event);
        CommonClick(event);
    }
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 * @param {TouchEvent} event
 */
function TouchStart(event) {
    if (CommonIsMobile && MainCanvas) {
        TouchMove(event.touches[0]);
        CommonClick(event);
    }
}

/**
 * When touch moves, we keep it's position for other scripts
 * @param {Touch} touch
 */
function TouchMove(touch) {
    if (MainCanvas) {
        MouseX = Math.round((touch.pageX - MainCanvas.canvas.offsetLeft) * 2000 / MainCanvas.canvas.clientWidth);
        MouseY = Math.round((touch.pageY - MainCanvas.canvas.offsetTop) * 1000 / MainCanvas.canvas.clientHeight);
    }
}

/**
 * When mouse move, we keep the mouse position for other scripts
 * @param {MouseEvent} event
 */
function MouseMove(event) {
    if (MainCanvas) {
        MouseX = Math.round(event.offsetX * 2000 / MainCanvas.canvas.clientWidth);
        MouseY = Math.round(event.offsetY * 1000 / MainCanvas.canvas.clientHeight);
    }
}

/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 * @param {MouseEvent} event
 */
function LoseFocus(event) {
    if (event.relatedTarget || event.toElement) {
        MouseX = -1;
        MouseY = -1;
    }
}