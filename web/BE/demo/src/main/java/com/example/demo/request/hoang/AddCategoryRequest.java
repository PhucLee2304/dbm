package com.example.demo.request.hoang;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCategoryRequest {
    @NotBlank(message = "Category name must not be blank")
    private String name;
}
