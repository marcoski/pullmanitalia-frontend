import moment from 'moment';

class DateTimeHandler{
  
  static ceilTimeToQuarter(date, compare){
    const quarters = [0, 15, 30, 45, 60]
    let hh = date.format('HH');
    let m = parseInt(date.format('m'));
    const approxDate = moment(date);
    for(let t = 0; t < quarters.length - 1; t++){
      if(m >= quarters[t] && m < quarters[t+1]){
        approxDate.minute(quarters[t]);
        if(!compare.isBefore(approxDate)){
          approxDate.minute(quarters[t+1]);
          if((t+1) === quarters.length - 1){
            hh = parseInt(hh) + 1;
          }
        }
      }
    }
    
    approxDate.hour(hh);
    return approxDate;
  }
  
  static floorTimeToQuarter(date){
    const quarters = [0, 15, 30, 45, 60]
    let hh = date.format('HH');
    let m = parseInt(date.format('m'));
    const approxDate = moment(date);
    for(let t = 0; t < quarters.length - 1; t++){
      if(m >= quarters[t] && m < quarters[t+1]){
        approxDate.minute(quarters[t+1]);
        if((t+1) === quarters.length - 1){
          hh = parseInt(hh) + 1;
        }
      }
    }
    
    approxDate.hour(hh);
    return approxDate;
  }

  static getTimeOptions(timeToStart = 0, startStep = 0){
    let options = [];
    const maxStep = 45;
    const maxTime = 24;
    for(let i = timeToStart; i < maxTime; i++){
      let s = startStep;
      if(i > 0 && startStep > 0){
        s = 0;
      }
      for(let j = s; j <= maxStep; j += 15){
          let h = i;
          let m = j;
          if(h < 10){
              h = '0' + h;
          }
          if(m < 10){
              m = '0' + m;
          }

          options.push({
              value: {
                  h: h,
                  m: m
              },
              text: h + ":" + m
          });
      }
    }

    return options;
  }

  static getTimeOptionsFromDate(date, compare){
    const floorDate = DateTimeHandler.floorTimeToQuarter(date);
    
    if(!DateTimeHandler.isSameDay(date, compare)){
      return DateTimeHandler.getTimeOptions()
    }

    return DateTimeHandler.getTimeOptions(floorDate.hour(), floorDate.minute());
  }

  static isSameDay(date, compare){
    let d = moment(date.format('YYYY-MM-DD'));
    let c = moment(compare.format('YYYY-MM-DD'));
    return d.isSame(c);
  }

  static getDurationDiff(dateOne, dateTwo){
    const duration = moment.duration(dateTwo.diff(dateOne));
    return duration.asSeconds();
  }

  static getDurationString(seconds){
    const mDuration = moment.duration(seconds, 's');
    let durationStr = '';
    if(mDuration.years() > 0){
      durationStr += mDuration.years() + "y ";
    }
    if(mDuration.months() > 0){
      durationStr += mDuration.months() + "m ";
    }
    if(mDuration.days() > 0){
      durationStr += mDuration.days() + "d ";
    }
    if(mDuration.hours() > 0){
      durationStr += mDuration.hours() + "h ";
    }
    if(mDuration.minutes() > 0){
      durationStr += mDuration.minutes() + "m ";
    }
    
    return durationStr.trim();
  }
}

export default DateTimeHandler;