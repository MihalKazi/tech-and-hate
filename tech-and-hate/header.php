<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title><?php wp_title('|', true, 'right'); ?></title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@400;600;800&display=swap" rel="stylesheet">

    <script src="https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js"></script>

    <script src="<?php echo get_template_directory_uri(); ?>/js/pattern-renderer.js"></script>

    <script src="<?php echo get_template_directory_uri(); ?>/js/prediction-design.js"></script>

    <?php wp_head(); ?>

    <style>
        .site-header-bar { padding: 20px; text-align: center; background: #fff; border-bottom: 1px solid #eee; }
        .site-logo { font-family: 'Work Sans', sans-serif; font-weight: 800; font-size: 1.5rem; color: #8B3B37; text-decoration: none; }
    </style>
</head>

<body <?php body_class(); ?>>
<header class="site-header-bar"><a href="<?php echo home_url(); ?>" class="site-logo">NIEMAN LAB</a></header>
<main id="content" class="site-content">