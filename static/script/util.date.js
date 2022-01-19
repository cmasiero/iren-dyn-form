var utilDate = {};

utilDate.toDDMMYYYY = (date, separator) => {

    let day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    let month = date.getMonth() + 1;
    month = month < 10 ? `0${month}` : month;
    let year = date.getFullYear();

    return `${day}${separator}${month}${separator}${year}`;

}

utilDate.toDDMMYYYY_HHMMSS = (date, separatorDate, separatorTime) => {

    let dateFormat = utilDate.toDDMMYYYY(date, separatorDate);

    let hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds(); 

    return `${dateFormat} ${hours}${separatorTime}${minutes}${separatorTime}${seconds}`;

};