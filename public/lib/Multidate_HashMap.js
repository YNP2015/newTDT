/**
 * HashMapSlider构造函数
 */
function HashMapSlider() {
    this.length = 0;
    this.prefix = "multidate_";   //不加前缀难以和已有的分辨开来。导致
}
/**
 * 向HashMapSlider中添加键值对
 */
HashMapSlider.prototype.put = function (key, value) {
    if(this.containsKey(key)){
        return;
    }else{
        this[this.prefix + key] = value;
        this.length ++;
    }

}

/**
 * 从HashMapSlider中获取value值   yaocs添加
 */
HashMapSlider.prototype.set = function(key, value) {
    this[this.prefix + key] = value;
}


/**
 * 从HashMapSlider中获取value值
 */
HashMapSlider.prototype.get = function(key) {
    return typeof(this[this.prefix + key]) == "undefined" ? null : this[this.prefix + key];
}
/**
 * 从HashMapSlider中获取所有key的集合，以数组形式返回
 */
HashMapSlider.prototype.keySet = function() {
    var arrKeySet = new Array();
    var index = 0;
    for(var strKey in this) {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            arrKeySet[index ++] = strKey.substring(this.prefix.length);
    }
    return arrKeySet.length == 0 ? null : arrKeySet;
}
/**
 * 从HashMapSlider中获取value的集合，以数组形式返回
 */
HashMapSlider.prototype.values = function() {
    var arrValues = new Array();
    var index = 0;
    for(var strKey in this) {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            arrValues[index ++] = this[strKey];
    }
    return arrValues.length == 0 ? null : arrValues;
}
/**
 * 获取HashMapSlider的value值数量
 */
HashMapSlider.prototype.size = function() {
    return this.length;
}
/**
 * 删除指定的值
 */
HashMapSlider.prototype.remove = function(key) {
    delete this[this.prefix + key];
    this.length --;
}
/**
 * 清空HashMapSlider
 */
HashMapSlider.prototype.clear = function() {
    for(var strKey in this) {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            delete this[strKey];
    }
    this.length = 0;
}
/**
 * 判断HashMapSlider是否为空
 */
HashMapSlider.prototype.isEmpty = function() {
    return this.length == 0;
}
/**
 * 判断HashMapSlider是否存在某个key
 */
HashMapSlider.prototype.containsKey = function(key) {
    for(var strKey in this) {
        if(strKey == this.prefix + key)
            return true;
    }
    return false;
}
/**
 * 判断HashMapSlider是否存在某个value
 */
HashMapSlider.prototype.containsValue = function(value) {
    for(var strKey in this) {
        if(this[strKey] == value)
            return true;
    }
    return false;
}
/**
 * 把一个HashMapSlider的值加入到另一个HashMapSlider中，参数必须是HashMapSlider
 */
HashMapSlider.prototype.putAll = function(map) {
    if(map == null)
        return;
    if(map.constructor != JHashMapSlider)
        return;
    var arrKey = map.keySet();
    var arrValue = map.values();
    for(var i in arrKey)
        this.put(arrKey[i],arrValue[i]);
}
//toString
HashMapSlider.prototype.toString = function() {
    var str = "";
    for(var strKey in this) {
        if(strKey.substring(0,this.prefix.length) == this.prefix)
            str += strKey.substring(this.prefix.length) + " : " + this[strKey] + "\r\n";
    }
    return str;
}