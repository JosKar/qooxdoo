function QxDockLayout()
{
  QxLayout.call(this);  
};

QxDockLayout.extend(QxLayout, "QxDockLayout");

QxDockLayout.addProperty({ name : "respectAutoRequirements", type : Boolean, defaultValue : true });



/*
------------------------------------------------------------------------------------
  CUSTOM WIDGET ADDER
------------------------------------------------------------------------------------
*/

proto.add = function()
{
  var l = arguments.length;
  var d = arguments[l-1];
  var o;
  
  if (isValidString(d)) 
  {
    l--;
  }
  else
  {
    d = "auto";
  };

  for (var i=0; i<l; i++)
  {
    o = arguments[i];
    
    if (!(o instanceof QxWidget))
    {
      throw new Error("Invalid Widget: " + o);
    }
    else
    {
      o.setParent(this);
      o.setLayoutHint(d);
    };
  };

  return this;  
};




/*
------------------------------------------------------------------------------------
  RENDERER: PLACEMENT OF CHILDREN
------------------------------------------------------------------------------------
*/

proto._layoutInternalWidgetsHorizontal = function()
{
  var innerWidth = this.getInnerWidth();
  if (innerWidth == 0) {
    return;
  };
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc, cht;
  
  var grouped = {
    left : [],
    right : [],
    orthogonal : [],
    auto : []
  };
  
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    cht = chc.getLayoutHint();
    
    switch(cht)
    {
      case "left":
      case "right":
      case "auto":
        grouped[cht].push(chc);
        break;
        
      case "top":
      case "bottom":
        grouped["orthogonal"].push(chc);
        break;
        
      default:
        throw new Error("QxDockLayout does not support layout hint '" + cht + "' for child " + chc);
    };
  };

  if (grouped.auto.length > 1) {
    throw new Error("QxDockLayout can not handle multiple auto children!");
  };

  
  
  /*
  -----------------------
    LEFT
  -----------------------
  */
  var leftList = grouped.left;
  var leftLength = leftList.length;
  var leftLast = 0;  
  
  for (var i=0; i<leftLength; i++)
  {
    chc = leftList[i];
    
    chc._applyPositionHorizontal(leftLast);
    leftLast += this._prepareSizeValue(chc.getAnyWidth(), innerWidth, chc.getMinWidth(), chc.getMaxWidth());
  };
  
  
  
  /*
  -----------------------
    RIGHT
  -----------------------
  */
  var rightList = grouped.right;
  var rightLength = rightList.length;
  var rightLast = innerWidth;
  
  for (var i=0; i<rightLength; i++)
  {
    chc = rightList[i];
    
    rightLast -= this._prepareSizeValue(chc.getAnyWidth(), innerWidth, chc.getMinWidth(), chc.getMaxWidth());
    chc._applyPositionHorizontal(rightLast);
  };  
  
  

  /*
  -----------------------
    ORTHOGONAL
  -----------------------
  */
  var orthogonalList = grouped.orthogonal;
  var orthogonalLength = orthogonalList.length;
  
  for (var i=0; i<orthogonalLength; i++)
  {
    chc = orthogonalList[i];
    
    chc._applyPositionHorizontal(0);
    chc._applySizeHorizontal(innerWidth);    
  };
  
  
  
  /*
  -----------------------
    AUTO
  -----------------------
  */  
  var autoList = grouped.auto;
  var autoLength = autoList.length;
  var autoItem = autoList[0];
  var autoSpace = Math.max(0, rightLast - leftLast);
  
  if (autoItem)
  {
    autoItem._applyPositionHorizontal(leftLast);
    autoItem._applySizeHorizontal(autoSpace);
  };
};





proto._layoutInternalWidgetsVertical = function() 
{
  var innerHeight = this.getInnerHeight();
  if (innerHeight == 0) {
    return;
  };
  
  var ch = this.getChildren();
  var chl = ch.length;
  var chc, cht;
  
  var grouped = {
    top : [],
    bottom : [],
    orthogonal : [],
    auto : []
  };
  
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    cht = chc.getLayoutHint();
    
    switch(cht)
    {
      case "top":
      case "bottom":
      case "auto":
        grouped[cht].push(chc);
        break;
        
      case "left":
      case "right":
        grouped["orthogonal"].push(chc);
        break;
        
      default:
        throw new Error("QxDockLayout does not support layout hint '" + cht + "' for child " + chc);
    };
  };
  
  if (grouped.auto.length > 1) {
    throw new Error("QxDockLayout can not handle multiple auto children!");
  };
  


  /*
  -----------------------
    TOP
  -----------------------
  */
  var topList = grouped.top;
  var topLength = topList.length;
  var topLast = 0;  
  
  for (var i=0; i<topLength; i++)
  {
    chc = topList[i];
    
    chc._applyPositionVertical(topLast);    
    topLast += this._prepareSizeValue(chc.getAnyHeight(), innerHeight, chc.getMinHeight(), chc.getMaxHeight());
  };
  
  
  
  /*
  -----------------------
    BOTTOM
  -----------------------
  */
  var bottomList = grouped.bottom;
  var bottomLength = bottomList.length;
  var bottomLast = innerHeight;
  
  for (var i=0; i<bottomLength; i++)
  {
    chc = bottomList[i];
    
    bottomLast -= this._prepareSizeValue(chc.getAnyHeight(), innerHeight, chc.getMinHeight(), chc.getMaxHeight());
    chc._applyPositionVertical(bottomLast);
  };
  
  
 
  /*
  -----------------------
    ORTHOGONAL AND AUTO
  -----------------------
  */
  var otherList = grouped.orthogonal.concat(grouped.auto);
  var otherSpace = Math.max(0, bottomLast - topLast);
  
  for (var i=0, l=otherList.length; i<l; i++)
  {
    chc = otherList[i];
    
    chc._applyPositionVertical(topLast);
    chc._applySizeVertical(otherSpace);
  };
};

proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) 
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  var accumulatedWidth = 0;
  var maxSingleRequiredWidth = 0;
  var respectAutoRequirements = this.getRespectAutoRequirements();
  
  var tempSize;
  
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    cht = chc.getLayoutHint();
    
    switch(cht)
    {
      case "top":
      case "bottom":
        tempSize = chc.getAnyWidth();
        tempSize = isValidNumber(tempSize) ? tempSize : 0;
        maxSingleRequiredWidth = Math.max(Math.min(Math.max(chc.getMinWidth(), tempSize), chc.getMaxWidth()), maxSingleRequiredWidth);
        break;
        
      case "auto":        
        if (!respectAutoRequirements) {
          break;
        };

      case "left":
      case "right":
        tempSize = chc.getAnyWidth();
        tempSize = isValidNumber(tempSize) ? tempSize : 0;        
        accumulatedWidth += Math.min(Math.max(tempSize, chc.getMinWidth(), chc.getMaxWidth()));
        break;
        
      default:
        throw new Error("QxDockLayout does not support layout hint '" + cht + "' for child " + chc);
    };
  };    
  
  return Math.max(0, Math.max(accumulatedWidth, maxSingleRequiredWidth));
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) 
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;
  
  var accumulatedHeight = 0;
  var maxSingleRequiredHeight = 0;
  var respectAutoRequirements = this.getRespectAutoRequirements();
  
  var tempSize;
  
  for (var i=0; i<chl; i++) 
  {
    chc = ch[i];
    cht = chc.getLayoutHint();
    
    switch(cht)
    {
      case "top":
      case "bottom":
        tempSize = chc.getAnyHeight();
        tempSize = isValidNumber(tempSize) ? tempSize : 0;        
        accumulatedHeight += Math.min(Math.max(tempSize, chc.getMinHeight()), chc.getMaxHeight());
        break;

      case "auto":        
        if (!respectAutoRequirements) {
          break;
        };        
        
      case "left":
      case "right":
        tempSize = chc.getAnyHeight();
        tempSize = isValidNumber(tempSize) ? tempSize : 0;      
        maxSingleRequiredHeight = Math.max(Math.min(Math.max(chc.getMinHeight(), tempSize), chc.getMaxHeight()), maxSingleRequiredHeight);
        break;
        
      default:
        throw new Error("QxDockLayout does not support layout hint '" + cht + "' for child " + chc);
    };
  };    
  
  return accumulatedHeight + maxSingleRequiredHeight;
};

proto._prepareSizeValue = function(size, full, min, max) 
{
  var t = typeof size == "string" ? Math.round(parseInt(size) * full / 100) : size;
  if (!isValidNumber) {
    return null;
  };

  return t.limit(min, max);
};