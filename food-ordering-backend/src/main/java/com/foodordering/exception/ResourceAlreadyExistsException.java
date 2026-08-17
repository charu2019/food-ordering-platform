package com.foodordering.exception;

// ResourceAlreadyExistsException.java
public class ResourceAlreadyExistsException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -6446257956330583498L;

	public ResourceAlreadyExistsException(String message) {
        super(message);
    }
}