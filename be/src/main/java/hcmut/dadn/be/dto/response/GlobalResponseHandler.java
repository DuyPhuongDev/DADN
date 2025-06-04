package hcmut.dadn.be.dto.response;

import hcmut.dadn.be.exception.GlobalExceptionHandler;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalResponseHandler implements ResponseBodyAdvice<Object> {

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return !returnType.hasMethodAnnotation(ExceptionHandler.class);
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  MethodParameter returnType,
                                  MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request,
                                  ServerHttpResponse response) {

        if (body instanceof ApiResponse) {
            return body; // đã format rồi
        }
        
        // Check if it's a Spring error response
        if (body instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) body;
            if (map.containsKey("status") && map.containsKey("error") && map.containsKey("path")) {
                // It's a Spring error response, transform it to our format
                Integer statusCode = (Integer) map.get("status");
                String errorMessage = (String) map.get("error");
                String path = (String) map.get("path");
                
                return ApiResponse.builder()
                        .status(statusCode)
                        .message(errorMessage)
                        .timestamp(LocalDateTime.now())
                        .path(path)
                        .build();
            }
        }

        return ApiResponse.builder()
                .status(HttpStatus.OK.value())
                .message("success")
                .data(body)
                .timestamp(LocalDateTime.now())
                .path(((ServletServerHttpRequest) request).getServletRequest().getRequestURI())
                .build();
    }
}