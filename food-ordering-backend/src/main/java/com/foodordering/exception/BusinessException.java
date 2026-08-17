package com.foodordering.exception;

// BusinessException.java
public class BusinessException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -8127352511993395861L;

	public BusinessException(String message) {
        super(message);
    }
}