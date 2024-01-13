package com.rls.chat.auth.model;

/**
 * Représente la requête à envoyer sur une connexion.
 */
public record LoginRequest(String username, String password) {
}
