/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A selection manager. This is a helper class that handles all selection
 * related events and updates a SelectionModel.
 * <p>
 * Widgets that support selection should use this manager. This way the only
 * thing the widget has to do is mapping mouse or key events to indexes and
 * call the corresponding handler method.
 *
 * @see SelectionModel
 */
qx.OO.defineClass("qx.ui.table.SelectionManager", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * The selection model where to set the selection changes.
 */
qx.OO.addProperty({ name:"selectionModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.SelectionModel" });


/**
 * Handles the mouse down event.
 *
 * @param index {int} the index the mouse is pointing at.
 * @param evt {Map} the mouse event.
 */
qx.Proto.handleMouseDown = function(index, evt) {
  var selectionModel = this.getSelectionModel();
  if (!selectionModel.isSelectedIndex(index)) {
    // This index is not selected -> We react when the mouse is pressed (because of drag and drop)
    this._handleSelectEvent(index, evt);
    this._lastMouseDownHandled = true;
  } else {
    // This index is already selected -> We react when the mouse is released (because of drag and drop)
    this._lastMouseDownHandled = false;
  }
}


/**
 * Handles the mouse up event.
 *
 * @param index {int} the index the mouse is pointing at.
 * @param evt {Map} the mouse event.
 */
qx.Proto.handleMouseUp = function(index, evt) {
  if (!this._lastMouseDownHandled) {
    this._handleSelectEvent(index, evt);
  }
}


/**
 * Handles the mouse click event.
 *
 * @param index {int} the index the mouse is pointing at.
 * @param evt {Map} the mouse event.
 */
qx.Proto.handleClick = function(index, evt) {
}


/**
 * Handles the key down event.
 *
 * @param index {int} the index that is currently focused.
 * @param evt {Map} the key event.
 */
qx.Proto.handleKeyDown = function(index, evt) {
  if (evt.getKeyCode() == qx.event.type.KeyEvent.keys.space) {
    this._handleSelectEvent(index, evt);
  }
}


/**
 * Handles a select event.
 *
 * @param index {int} the index the event is pointing at.
 * @param evt {Map} the mouse event.
 */
qx.Proto._handleSelectEvent = function(index, evt) {
  var selectionModel = this.getSelectionModel();
  if (evt.getShiftKey()) {
    var leadIndex = selectionModel.getLeadSelectionIndex();
    if (index != leadIndex || selectionModel.isSelectionEmpty()) {
      // The lead selection index was changed
      var anchorIndex = selectionModel.getAnchorSelectionIndex();
      if (evt.isCtrlOrCommandPressed()) {
        selectionModel.addSelectionInterval(anchorIndex, index);
      } else {
        selectionModel.setSelectionInterval(anchorIndex, index);
      }
    }
  } else if (evt.isCtrlOrCommandPressed()) {
    if (selectionModel.isSelectedIndex(index)) {
      selectionModel.removeSelectionInterval(index, index);
    } else {
      selectionModel.addSelectionInterval(index, index);
    }
  } else {
    selectionModel.setSelectionInterval(index, index);
  }
}
