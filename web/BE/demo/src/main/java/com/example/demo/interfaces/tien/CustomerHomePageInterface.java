package com.example.demo.interfaces.tien;


import com.example.demo.entity.Category;
import com.example.demo.utils.ResponseData;

import java.util.List;

public interface CustomerHomePageInterface {
    ResponseData getAllCategories();
    ResponseData getRandomProduct();
    ResponseData findProductById(Long id);
    ResponseData getProductByKeyword(String keyword);
}
