package com.chrisbattarbee.self.resources;

import com.palantir.logsafe.SafeArg;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public final class Utils {
    private Utils() {}

    public static final String dateFormat = "yyyy-MM-dd";
    public static final DateTimeFormatter formatter = DateTimeFormat.forPattern(dateFormat);

    public static List<DateTime> getDateRange(DateTime start, DateTime end) {
        List<DateTime> ret = new ArrayList<DateTime>();
        DateTime tmp = start;
        while (tmp.isBefore(end) || tmp.equals(end)) {
            ret.add(tmp);
            tmp = tmp.plusDays(1);
        }
        return ret;
    }

    public static DateTime getDateTimeFromString(String startDate) {
        final Logger logger = LoggerFactory.getLogger(Utils.class);
        DateTime startDateTime = null;
        try {
            startDateTime = formatter.parseDateTime(startDate);
        } catch (IllegalArgumentException e) {
            logger.error(
                    "Provided StartDate {} does not match the format {}. Error: {}",
                    SafeArg.of("startDate", startDate),
                    SafeArg.of("dateFormat", dateFormat),
                    e);
        }
        return startDateTime;
    }

    static List<String> getDatesInRange(String startDate, String endDate) {
        DateTime startDateTime = getDateTimeFromString(startDate);
        DateTime endDateTime = getDateTimeFromString(endDate);

        List<DateTime> datesInRange = getDateRange(startDateTime, endDateTime);
        List<String> datesInRangeIsoStrings =
                datesInRange.stream().map(date -> date.toString(formatter)).collect(Collectors.toList());
        return datesInRangeIsoStrings;
    }
}
