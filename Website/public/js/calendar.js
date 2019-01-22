class Calendar {

    constructor(date) {

        /**
         * @namespace Calendar#data
         * @type {[{name: string userId: number todo: [] document: [] other: []}]}
         */
        this.data;

        this.selectedDate;

        this.today = new CalendarDate(date || null);
    }

    nextDay() {
        this.today.getNextDay();
    }

    prevDay() {
        this.today.getPrevDay();
    }

    getToday() {
        this.today.getNow();
    }

    setDate(element) {
        this.today.setDate(element.value);
    }

}


class CalendarDate {

    constructor(date) {
        if (date) {
            this.date = new Date(date);
        } else {
            this.date = new Date();
            this.date.setHours(0, 0, 0, 0); // fixes issues with grabbing data from the server.
        }

        this.year = this.date.getFullYear();
        this.day = this.date.getDate();
        this.month = this.date.getMonth() + 1;
    }

    getNextDay() {
        if (this.day < this.monthDays()) {
            this.day += 1;
        } else {
            this.day = 1;
            this.month += 1;
        }

        this.date = new Date(this.year, this.month - 1, this.day);
    }

    getPrevDay() {
        if (this.day > 1) {
            this.day -= 1;
        } else {
            this.month -= 1;
            this.day = this.monthDays();
        }

        this.date = new Date(this.year, this.month - 1, this.day);
    }

    getNow() {
        this.date = new Date();
        this.date.setHours(0, 0, 0, 0); // fixes issues with grabbing data from the server.

        this.year = this.date.getFullYear();
        this.day = this.date.getDate();
        this.month = this.date.getMonth() + 1;
    }

    /**
     * 
     * @param {String} date Date from date input
     */
    setDate(date) {

        // change the format of the string from YYYY-MM-DD to MM-DD-YYYY
        let a = date.split('-');
        let nDate = a[1] + "-" + a[2] + "-" + a[0];

        this.date = new Date(nDate);

        this.year = this.date.getFullYear();
        this.day = this.date.getDate();
        this.month = this.date.getMonth() + 1;
    }

    getMonth() {
        switch (this.date.getMonth()) {
            case 0:
                return "January";
            case 1:
                return "Febuary";
            case 2:
                return "March";
            case 3:
                return "April";
            case 4:
                return "May";
            case 5:
                return "June";
            case 6:
                return "July";
            case 7:
                return "August";
            case 8:
                return "September";
            case 9:
                return "October";
            case 10:
                return "November";
            case 11:
                return "December";
        }
    }

    getMonthShort() {
        switch (this.date.getMonth()) {
            case 0:
                return "Jan";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Apr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Aug";
            case 8:
                return "Sept";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dec";
        }
    }

    getYear() {
        return this.date.getFullYear();
    }

    getDate() {
        return this.date.getDate();
    }

    getISO() {
        return this.date.toISOString();
    }

    getDay() {
        switch (this.date.getDay()) {
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
        }
    }

    getDayShort() {
        switch (this.date.getDay()) {
            case 0:
                return "Sun";
            case 1:
                return "Mon";
            case 2:
                return "Tues";
            case 3:
                return "Wed";
            case 4:
                return "Thur";
            case 5:
                return "Fri";
            case 6:
                return "Sat";
        }
    }

    monthDays() {
        let d = new Date(this.year, this.month, 0);
        return d.getDate();
    }
}

module.exports = Calendar;