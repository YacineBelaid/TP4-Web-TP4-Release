package com.rls.chat.messages.model;

public record NewMessageRequest(String username, String text, ChatImageData imageData) {
}
