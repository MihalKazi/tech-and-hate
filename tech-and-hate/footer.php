<footer style="margin-top: 50px; padding: 20px; border-top: 1px solid #ccc; text-align: center;">
        <p>&copy; <?php echo date('Y'); ?> Tech & Hate. Replicating Nieman Lab.</p>
    </footer>

    <?php wp_footer(); ?> 
<div id="nlep-exit-popup" class="nlep-hidden">
    <div id="nlep-popup-inner">
        <button id="nlep-close-btn">&times;</button>
        
        <div class="nlep-optin-form">
            <h2>Don't Miss Out</h2>
            <p>Get the latest predictions and journalism tech news delivered directly to your inbox.</p>
            
            <form action="" method="post">
                <input type="email" class="nlep-email-input" placeholder="Enter your email address" required>
                <br>
                <button type="submit" class="nlep-submit-button">SUBSCRIBE</button>
            </form>
            
            <div class="nlep-sample-link">
                <a href="#">No spam, we promise.</a>
            </div>
        </div>
    </div>
</div>

<script src="<?php echo get_template_directory_uri(); ?>/js/predictions.js"></script>
</body>
</html>
</body>
</html>