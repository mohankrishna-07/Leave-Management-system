package com.leavemanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidLeaveException extends RuntimeException {

    public InvalidLeaveException(String message) {
        super(message);
    }
}
