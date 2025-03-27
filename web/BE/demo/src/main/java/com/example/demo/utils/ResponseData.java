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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
