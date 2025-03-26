package com.example.demo.interfaces.hieu;

import com.example.demo.request.hieu.PrepareOrderOnlineRequest;
import com.example.demo.utils.ResponseData;

public interface OrderInterface {
    ResponseData prepareOrderOnline(PrepareOrderOnlineRequest request);
}
