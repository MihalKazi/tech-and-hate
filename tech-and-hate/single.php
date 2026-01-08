<?php get_header(); ?>

<div class="single-post-container">
    <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>

        <a href="<?php echo home_url(); ?>" class="back-to-home">&larr; Back to Predictions</a>

        <header class="article-header">
            <span class="article-author"><?php the_author(); ?></span>
            <h1 class="article-title"><?php the_title(); ?></h1>
            <span class="article-date"><?php echo get_the_date('F j, Y'); ?></span>
        </header>

        <article class="article-content">
            <?php the_content(); ?>
        </article>
        
        <div class="article-footer">
            <p>Predicting the future of journalism.</p>
        </div>

    <?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>