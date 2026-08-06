package com.cineverse.controller;

import com.cineverse.repository.MovieGraphProjection;
import com.cineverse.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FranchiseController.class)
class FranchiseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MovieRepository movieRepository;

    @Test
    void testWatchOrder_EmptyResult() throws Exception {
        Mockito.when(movieRepository.findMoviesByFranchiseName("Marvel"))
               .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/franchise/Marvel/watch-order"))
               .andExpect(status().isNotFound())
               .andExpect(status().reason(org.hamcrest.Matchers.containsString("not found in graph")));
    }
}
