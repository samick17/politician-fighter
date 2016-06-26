const SECOND = 1000;
const MINUTE = SECOND*60;
const HOUR = MINUTE*60;
const DAY = HOUR*24;
const MONTH = DAY*30;

function parseDate(dateTime, callback) {
  var date = new Date(dateTime);
  if(date == 'Invalid Date')
    callback(new Error('invalid date'));
  else
    callback(null, date);
}

function nextMs(dateTime, offset) {
  return dateTime + offset;
}

function nextSec(dateTime, offset) {
  return dateTime + offset*SECOND;
}

function nextHours(dateTime, offset) {
  return dateTime + offset*HOUR;
}

function getBeginning(date) {
  var dateOfToday = new Date(date);
  var newDate = new Date(dateOfToday.getFullYear(), dateOfToday.getMonth(), dateOfToday.getDate());
  return newDate;  
}

function getEnd(date) {
  var dateOfToday = new Date(date);
  var newDate = new Date(dateOfToday.getFullYear(), dateOfToday.getMonth(), dateOfToday.getDate()+1);
  return newDate;  
}

var getBeginningOfThisMonth = function(y, m) {
  return new Date(y, m, 1, 0, 0);
}

var getNextMonth = function(y, m) {
  var y1 = y;
  var m1 = m;
  if(m === 11) {
    m1 = 0;
    y1 = y+1;
  }
  else {
    m1 = m+1;
  }
  return new Date(y1, m1, 1, 0, 0);
}

function getMonthPeriod(y, m) {
  if(m < 0 || m > 11)
    throw new Error('invalid month');
  return {
    start: getBeginningOfThisMonth(y, m),
    end: getNextMonth(y, m)
  };
}

function getMonthPeriodTime(y, m) {
  if(m < 0 || m > 11)
    throw new Error('invalid month');
  var beginningTime = getBeginningOfThisMonth(y, m).getTime();
  return {
    start: beginningTime,
    end: beginningTime + MONTH
  };
}

function getDeltaDate(date) {
  return (new Date(Date.now()) - new Date(date))/DAY;
}

function toLeading(num) {
  return ('0'+num).slice(-2)
}

Date.prototype.yyyymmddtt = function() {
  var month = this.getMonth();
  var hours = this.getHours();
  var min = this.getMinutes();
  var dateStr = '{0}-{1}-{2} {3}:{4}'.format(this.getFullYear(), toLeading(month+1), this.getDate(), toLeading(hours), toLeading(min));
  return dateStr;
};

module.exports = {
  parseDate: parseDate,
  nextMs: nextMs,
  nextSec: nextSec,
  nextHours: nextHours,
  getBeginning: getBeginning,
  getEnd: getEnd,
  getMonthPeriod: getMonthPeriod,
  getMonthPeriodTime: getMonthPeriodTime,
  getDeltaDate: getDeltaDate,
  constant: {
    second: SECOND,
    minute: MINUTE,
    hour: HOUR,
    day: DAY,
    month: MONTH
  }
};