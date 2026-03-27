package com.stored.storedsystemmanagement.entity;

public enum RoleType {
    ADMIN("ADMIN"),
    USER("USER");

    private final String value;

    RoleType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RoleType fromValue(String value) {
        for (RoleType role : RoleType.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
