package com.example.demo.interfaces.hoang;

import com.example.demo.request.hoang.AddProductRequest;
import com.example.demo.utils.ResponseData;

public interface ProductInterface {
    ResponseData addProduct(AddProductRequest request);

    ResponseData updateProduct(Long id, AddProductRequest request);

    ResponseData getAllProducts();

    ResponseData deleteProduct(Long id);
}
