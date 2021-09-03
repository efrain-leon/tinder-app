import moment from 'moment-timezone';

 const dateUtils = {};
 
 dateUtils.utcUnix = (date) => {
	if (date) {
		return moment(date).utc().format('x') * 1;
	}

	return moment().utc().format('x') * 1;
}

dateUtils.currentDate = (date) => {
	if (date) {
		return moment(date).utc().format('x') * 1;
	}

	return moment().utc().format('x') * 1;
}

dateUtils.inDays = (d1, d2, includeStartDate = true) => {
	let t1 = moment(d1);
	let t2 = moment(d2);

	if (t1 > t2) {
		return 0;
	}

	if (includeStartDate) {
		return t2.diff(t1, 'days') + 1;
	}

	return t2.diff(t1, 'days');
}

dateUtils.inWeeks = (d1, d2) => {
	var t2 = d2.getTime();
	var t1 = d1.getTime();

	return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
}

dateUtils.inMonths = (d1, d2) => {
	var d1Y = d1.getFullYear();
	var d2Y = d2.getFullYear();
	var d1M = d1.getMonth();
	var d2M = d2.getMonth();

	return d2M + 12 * d2Y - (d1M + 12 * d1Y);
}

dateUtils.inYears = (d1, d2) => {
	let t1 = moment(d1);
	let t2 = moment(d2);

	if (t1 > t2) {
		return 0;
	}
	
	return t2.diff(t1, 'years');
}

dateUtils.getMonthDateRange = (year, month) => {
	let startDate = moment([year, month - 1]);

	let endDate = moment(startDate).endOf('month');

	return { startDate: Number(startDate.utc().format('x')), endDate: Number(endDate.utc().format('x')) };
}

export default dateUtils;