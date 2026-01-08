<?php get_header(); ?>

<div class="predictions-container">
    <div class="hero-text-section">
        <h1 class="hero-title">Predictions for<br>Journalism 2026</h1>
        <p class="hero-subtitle">Each year, we ask some of the smartest people in digital media what they think is coming in the year ahead.</p>
    </div>
    
    <div class="predictions-controls">
        <div class="sort-buttons">
            <button class="sort-btn active" data-sort="default">Shuffle</button>
            <button class="sort-btn" data-sort="name">Sort by Name</button>
            <button class="sort-btn" data-sort="date">Sort by Date</button>
        </div>
    </div>

    <div id="prediction-grid" class="prediction-grid">
        <?php 
        $args = array('post_type' => array('post', 'prediction', 'page'), 'posts_per_page' => -1, 'status' => 'publish', 'orderby' => 'date', 'order' => 'DESC');
        $custom_query = new WP_Query( $args );

        // Pattern cycle
        $patterns = array( 'blue', 'voronoi', 'arcs', 'spiral', 'wavelattice' ); 
        $counter = 0; 

        if ( $custom_query->have_posts() ) : 
            while ( $custom_query->have_posts() ) : $custom_query->the_post(); 
                if ( get_the_title() == 'Sample Page' || get_the_title() == 'Privacy Policy' ) continue; 

                $author_name = get_the_author();
                $post_date = get_the_date('Y-m-d');
                
                // Get the Excerpt for the "Quote"
                $quote = get_the_excerpt();
                if (empty($quote)) {
                    // Fallback if no excerpt exists
                    $quote = wp_trim_words( get_the_content(), 20, '...' );
                }
                
                // Pick a pattern style
                $style_key = $patterns[ $counter % count($patterns) ];
                $counter++; 
            ?>

            <div class="prediction-card <?php echo esc_attr($style_key); ?>" 
                 data-pattern="<?php echo esc_attr($style_key); ?>" 
                 data-name="<?php echo esc_attr($author_name); ?>" 
                 data-date="<?php echo esc_attr($post_date); ?>">
                
                <div class="card-inner">
                    <div class="card-front">
                        <canvas class="card-canvas" width="260" height="440"></canvas>
                        
                        <div class="card-header">
                            <span class="author-name"><?php echo esc_html($author_name); ?></span>
                        </div>
                        <div class="card-body">
                            <h2 class="prediction-title"><?php the_title(); ?></h2>
                            <p class="click-hint">Click to read</p>
                        </div>
                    </div>

                    <div class="card-back">
                        <button class="close-btn">&times;</button>
                        
                        <div class="back-content">
                            <div class="back-author"><?php echo esc_html($author_name); ?></div>
                            
                            <h3 class="back-title"><?php the_title(); ?></h3>
                            
                            <div class="back-quote">
                                &ldquo;<?php echo strip_tags($quote); ?>&rdquo;
                            </div>
                            
                          <a href="<?php the_permalink(); ?>" class="read-more-link" onclick="event.stopPropagation();">
    Read full prediction &rarr;
</a>
                        </div>
                    </div>
                </div>
            </div>

            <?php endwhile; wp_reset_postdata(); ?>
        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>