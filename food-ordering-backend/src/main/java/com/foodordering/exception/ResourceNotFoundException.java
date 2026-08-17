package com.foodordering.exception;

// ResourceNotFoundException.java
public class ResourceNotFoundException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -1559850941921197593L;

	public ResourceNotFoundException(String message) {
        super(message);
    }
}