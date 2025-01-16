import static net.grinder.script.Grinder.grinder
import net.grinder.script.GTest
import net.grinder.script.Grinder
import net.grinder.scriptengine.groovy.junit.GrinderRunner
import net.grinder.scriptengine.groovy.junit.annotation.BeforeProcess
import net.grinder.scriptengine.groovy.junit.annotation.BeforeThread
import net.grinder.scriptengine.groovy.junit.annotation.Test
import org.junit.runner.RunWith
import org.ngrinder.http.HTTPRequest
import org.ngrinder.http.HTTPRequestControl
import org.ngrinder.http.cookie.Cookie

@RunWith(GrinderRunner)
class TestRunner {
    public static HTTPRequest request
    public static String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzM3MDMyMTU1LCJleHAiOjE3MzcwMzU3NTV9.OBXXjvAlYI8rzK6fXKv_s07SUJlJOdx5y-6L4Sz6DnU"

    @BeforeProcess
    public static void beforeProcess() {
        request = new HTTPRequest()
        grinder.logger.info("before process.")
    }

    @BeforeThread
    public void beforeThread() {
        grinder.statistics.delayReports = true
        grinder.logger.info("before thread.")
    }

    @Test
    public void testGetTopicsWithCategories() {
        def headers = [
            "Content-Type": "application/json",
            "Authorization": "Bearer ${token}"
        ]
        
        def response = request.GET("http://host.docker.internal:3000/api/v1/posts/topics", headers)
        
        if (response.statusCode == 401) {
            grinder.logger.error("Authentication failed. Check your token.")
        }
    }

    @Test
    public void testGetCategoriesByTopic() {
        def headers = [
            "Content-Type": "application/json",
            "Authorization": "Bearer ${token}"
        ]
        
        def response = request.GET("http://host.docker.internal:3000/api/v1/posts/topics/1/categories", headers)
        
        if (response.statusCode == 401) {
            grinder.logger.error("Authentication failed. Check your token.")
        }
    }

    @Test
    public void testGetPostsByCategory() {
        def headers = [
            "Content-Type": "application/json",
            "Authorization": "Bearer ${token}"
        ]
        
        def response = request.GET("http://host.docker.internal:3000/api/v1/posts?category_id=1", headers)
        
        if (response.statusCode == 401) {
            grinder.logger.error("Authentication failed. Check your token.")
        }
    }

    @Test
    public void testGetPostsByTopic() {
        def headers = [
            "Content-Type": "application/json",
            "Authorization": "Bearer ${token}"
        ]
        
        def response = request.GET("http://host.docker.internal:3000/api/v1/posts?topic_id=1", headers)
        
        if (response.statusCode == 401) {
            grinder.logger.error("Authentication failed. Check your token.")
        }
    }
}