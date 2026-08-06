package com.cineverse.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JikanServiceTest {

    @Autowired
    private JikanService jikanService;

    @Test
    void testSpoilerSafeAnime_OngoingAnime_ActiveShield() {
        // One Piece (21) - ongoing, user at ep 12
        JikanService.SpoilerSafeResponse response = jikanService.getSpoilerSafeAnime(21, 12);
        
        assertNotNull(response);
        assertEquals("21", response.id());
        assertTrue(response.spoilerShieldActive(), "Shield should be active because upToEpisode < totalEpisodes");
        assertNull(response.synopsis(), "Synopsis should be null when shield is active");
        assertTrue(response.totalEpisodes() > 0, "totalEpisodes should dynamically resolve to > 0");
        assertTrue(response.safeEpisodes().size() <= 12, "Should only return up to 12 episodes");
    }

    @Test
    void testSpoilerSafeAnime_CompletedAnime_InactiveShield() throws InterruptedException {
        Thread.sleep(1500); // Prevent 429 Too Many Requests from Jikan API

        // Cowboy Bebop (1) - 26 episodes, user at 26
        JikanService.SpoilerSafeResponse response = jikanService.getSpoilerSafeAnime(1, 26);
        
        assertNotNull(response);
        assertEquals("1", response.id());
        assertFalse(response.spoilerShieldActive(), "Shield should be inactive as user finished the series");
        assertNotNull(response.synopsis(), "Synopsis should be visible");
        assertEquals(26, response.totalEpisodes());
        assertEquals(100, response.progressPercent());
    }
}
