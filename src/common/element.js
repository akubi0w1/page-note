/**
 * fontawesomeで使うアイコンを作る
 * @param {String} className 
 * @return {HTMLElement}
 */
export function createIconElement(className) {
  let elem = document.createElement("i");
  elem.className = className;
  return elem;
};


/**
 * drag and drop の実装
 * @param {String} dragTargetElemId D&D適用
 * @param {String} moveTargetElemId 動かすElementのID
 */
export function addDragAndDrop(dragTargetElemId, moveTargetElemId) {
  var x;
  var y;
  let dragTargetElem = document.getElementById(dragTargetElemId);
  dragTargetElem.addEventListener("mousedown", mouseDown, false);
  dragTargetElem.addEventListener("touchstart", mouseDown, false);
  function mouseDown(e) {
    document.getElementById(moveTargetElemId).classList.add("drag");

    if (e.type === "mousedown") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    let rect = document.getElementById(moveTargetElemId).getBoundingClientRect();
    x = event.pageX - rect.left;
    y = event.pageY - rect.top;

    document.body.addEventListener("mousemove", mouseMove, false);
    document.body.addEventListener("touchmove", mouseMove, false);
  }

  function mouseMove(e) {
    var drag = document.getElementsByClassName("drag")[0];
    if (!drag) {
      return;
    }

    if (e.type === "mousemove") {
      var event = e;
    } else {
      var event = e.changedTouches[0];
    }

    e.preventDefault();

    drag.style.top = event.pageY - y + "px";
    drag.style.left = event.pageX - x + "px";

    drag.addEventListener("mouseup", mouseUp, false);
    document.body.addEventListener("mouseleave", mouseUp, false);
    drag.addEventListener("touchend", mouseUp, false);
    document.body.addEventListener("touchleave", mouseUp, false);
  }

  function mouseUp() {
    var drag = document.getElementsByClassName("drag")[0];
    if (!drag) {
      return;
    }

    document.body.removeEventListener("mousemove", mouseMove, false);
    drag.removeEventListener("mouseup", mouseUp, false);
    document.body.removeEventListener("touchmove", mouseMove, false);
    drag.removeEventListener("touchend", mouseUp, false);

    drag.classList.remove("drag");
  }
}