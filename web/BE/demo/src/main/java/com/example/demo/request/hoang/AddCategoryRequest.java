package com.example.demo.request.hoang;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCategoryRequest {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
