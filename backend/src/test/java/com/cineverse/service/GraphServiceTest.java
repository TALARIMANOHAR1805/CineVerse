package com.cineverse.service;

import com.cineverse.repository.MovieRepository;
import com.cineverse.repository.MovieGraphProjection;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;

@SpringBootTest
class GraphServiceTest {

    @Autowired
    private GraphService graphService;

    @MockBean
    private MovieRepository movieRepository;

    @Test
    void testGetRelated_GracefulFailure() {
        // Simulate Neo4j exception
        Mockito.when(movieRepository.findRelatedBySharedActors(anyString()))
               .thenThrow(new RuntimeException("Neo4j down"));
        
        Mockito.when(movieRepository.findFranchiseSiblings(anyString()))
               .thenReturn(Collections.emptyList());

        // Should not crash, should return empty connections gracefully
        GraphService.GraphResult result = graphService.getRelated("12345");
        
        assertNotNull(result);
        assertEquals("12345", result.sourceTmdbId());
        assertTrue(result.connections().isEmpty());
        assertFalse(result.hasGraph());
    }
}
