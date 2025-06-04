package hcmut.dadn.be.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum EnumException {

    // 400 : Bad request
    MODULE_GROUP_ALREADY_EXISTS(HttpStatus.BAD_REQUEST, "Module group already exists"),

    // 404: Not found
    MODULE_GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "Module group not found"),;

    private final HttpStatus statusCode;
    private final String message;

    EnumException(HttpStatus statusCode, String message) {
        this.statusCode = statusCode;
        this.message = message;
    }
}
