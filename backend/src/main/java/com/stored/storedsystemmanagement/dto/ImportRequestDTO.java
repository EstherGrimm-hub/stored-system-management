package com.stored.storedsystemmanagement.dto;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class ImportRequestDTO {
    @NotEmpty(message = "Danh sách hàng nhập không được trống")
    @Valid
    private List<ImportDetailRequestDTO> items;
}