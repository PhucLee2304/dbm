package com.example.demo.utils;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResponseData {
    int status = 200;
    boolean success;
    String message;
    Object data;

    public static ResponseData success(String message, Object data) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(true);
        responseData.setMessage(message);
        responseData.setData(data);
        return responseData;
    }

    public static ResponseData error(String message) {
        ResponseData responseData = new ResponseData();
        responseData.setSuccess(false);
        responseData.setMessage(message);
        return responseData;
    }
}
