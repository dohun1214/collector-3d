package com.collector.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AiProcessRequest(
        @JsonProperty("item_id") Long itemId,
        @JsonProperty("file_type") String fileType,
        @JsonProperty("file_paths") List<String> filePaths,
        @JsonProperty("callback_url") String callbackUrl
) {}
