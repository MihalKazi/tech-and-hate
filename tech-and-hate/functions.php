<?php

function techandhate_setup() {
    // Add support for Featured Images (if you want them later)
    add_theme_support( 'post-thumbnails' );
}
add_action( 'after_setup_theme', 'techandhate_setup' );

// 1. Register the "Predictions" Post Type
function create_prediction_post_type() {
    register_post_type( 'prediction',
        array(
            'labels' => array(
                'name' => __( 'Predictions' ),
                'singular_name' => __( 'Prediction' )
            ),
            'public' => true,
            'has_archive' => true,
            'menu_icon' => 'dashicons-lightbulb', // Adds a lightbulb icon
            'supports' => array( 'title', 'editor', 'excerpt', 'author', 'thumbnail' ),
            'rewrite' => array('slug' => 'predictions'),
            'show_in_rest' => true, // Important for the Block Editor
        )
    );
}
add_action( 'init', 'create_prediction_post_type' );

// 2. Register the "Pattern" Selector (Taxonomy)
function create_pattern_taxonomy() {
    $labels = array(
        'name'              => 'Patterns',
        'singular_name'     => 'Pattern',
        'search_items'      => 'Search Patterns',
        'all_items'         => 'All Patterns',
        'edit_item'         => 'Edit Pattern',
        'update_item'       => 'Update Pattern',
        'add_new_item'      => 'Add New Pattern',
        'new_item_name'     => 'New Pattern Name',
        'menu_name'         => 'Patterns',
    );

    $args = array(
        'hierarchical'      => true, // Checkbox style (like Categories)
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'pattern' ),
        'show_in_rest'      => true, // Shows in the side panel of Block Editor
    );

    // Add this "Pattern" box to Predictions, standard Posts, and Pages
    register_taxonomy( 'prediction_pattern', array( 'prediction', 'post', 'page' ), $args );
}
add_action( 'init', 'create_pattern_taxonomy' );

// 3. Load our CSS and JS
function techandhate_scripts() {
    wp_enqueue_style( 'main-style', get_stylesheet_uri(), array(), time() ); // Time forces refresh
    
    // Load Isotope (The Grid Engine)
    wp_enqueue_script( 'isotope', get_template_directory_uri() . '/js/isotope.pkgd.min.js', array(), '3.0.6', true );
    
    // Load our Custom JS
    wp_enqueue_script( 'predictions-js', get_template_directory_uri() . '/js/predictions.js', array('isotope'), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'techandhate_scripts' );

/* * ============================================================
 * AUTO-CONTENT GENERATOR (Paste at bottom of functions.php)
 * ============================================================
 */
function techandhate_generate_content() {
    
    // Only run this if we are an admin (safety check)
    if ( ! current_user_can( 'manage_options' ) ) return;

    // The Content Data (Titles, Authors, and the Full Article Text)
    $predictions = array(
        array(
            'title'  => 'The Metaverse Is Finally Dead, Long Live the Spatial Web',
            'author' => 'Sarah Connor',
            'content' => '
                <p>For years, we were promised a digital utopia where we would live, work, and play in a seamless virtual world. But the headset-heavy vision of the Metaverse has collapsed under its own weight. The hardware was too clunky, the software too buggy, and the use cases too few.</p>
                <p><strong>But don\'t mistake the death of the "Metaverse" for the death of spatial computing.</strong></p>
                <p>We are seeing a pivot. Instead of full immersion, we are moving toward augmented utility. The "Spatial Web" isn\'t about escaping reality; it\'s about overlaying data onto the physical world in a way that feels natural. Think less "Ready Player One" and more "Iron Man HUD."</p>
                <p>By 2026, the dominant form of AR won\'t be glasses—it will be auditory. Smart earbuds with context-aware AI assistants will whisper directions, translations, and notifications directly into our ears, creating a screen-free layer of information that permeates our daily lives.</p>
                <p>The companies that bet on VR headsets are pivoting to "ambient computing," and the ones that ignored the hype are now quietly building the infrastructure for a world where the internet is everywhere, but visible nowhere.</p>
            '
        ),
        array(
            'title'  => 'Why Your Smart Fridge Will Eventually Sue You',
            'author' => 'David K.',
            'content' => '
                <p>It sounds like science fiction, but the legal framework is already being laid. As IoT devices become more autonomous, they are beginning to make decisions that have financial and legal consequences. Your smart fridge orders groceries. Your autonomous car navigates traffic. Your AI assistant manages your calendar.</p>
                <p>But what happens when the fridge orders $500 of spoiled milk due to a sensor error? Or when your car chooses a route that violates a new traffic ordinance?</p>
                <p><strong>The concept of "Algorithmic Personhood" is gaining traction.</strong></p>
                <p>In the next few years, we will see the first major lawsuit where the defendant is not the manufacturer, but the software agent itself. Insurance companies are already creating policies for "AI Liability," and end-user license agreements are shifting responsibility away from the developers and onto the algorithms.</p>
                <p>We are entering an era where our devices are not just tools, but legal entities with limited rights and responsibilities. The next time you yell at Alexa, be careful—she might just file a harassment claim.</p>
            '
        ),
        array(
            'title'  => 'Generative AI Eats the Open Web',
            'author' => 'Elena R.',
            'content' => '
                <p>The open web was built on a simple social contract: creators publish content, search engines index it, and users click links to visit the source. That contract is broken.</p>
                <p>With the rise of Large Language Models (LLMs) and generative search, users no longer need to click. The answer is synthesized and served directly on the search results page. Traffic to independent blogs, news sites, and forums is plummeting.</p>
                <p><strong>This is the "Napster Moment" for text.</strong></p>
                <p>Just as music piracy forced the industry to adapt or die, AI scraping is forcing publishers to rethink their business models. We predict a massive shift toward "gated communities." The best content will disappear behind paywalls, newsletters, and private Discords, leaving the public web as a wasteland of AI-generated SEO spam talking to other AI bots.</p>
                <p>Authenticity will become the new luxury good. If you want human-written insight, you will have to pay for it, and you will have to verify your humanity to access it.</p>
            '
        ),
        array(
            'title'  => 'The Great Social Media Fragmentation',
            'author' => 'Marcus T.',
            'content' => '
                <p>The era of the "Digital Town Square" is over. Twitter (X), Facebook, and Instagram are no longer the monolithic centers of culture they once were. The algorithm fatigue is real, and users are retreating.</p>
                <p>We are seeing a migration to smaller, niche platforms. Mastodon for geeks, LinkedIn for corporate bragging, TikTok for entertainment, and Group Chats for actual connection.</p>
                <p><strong>The future is feudal.</strong></p>
                <p>Instead of one giant network connecting everyone, the internet is breaking into thousands of smaller fiefdoms. This makes viral marketing harder, but community building easier. Brands can no longer just buy ads to reach "everyone"; they have to actually participate in these micro-communities.</p>
                <p>This fragmentation is healthier for our brains but terrible for advertisers. And that is why the tech giants are terrified.</p>
            '
        ),
        array(
            'title'  => 'Crypto Returns, But Boring This Time',
            'author' => 'Satoshi N.',
            'content' => '
                <p>The speculative mania is gone. The NFTs of bored apes are worthless. The get-rich-quick schemes have collapsed. And that is exactly why Crypto is finally interesting again.</p>
                <p>With the scammers washed out, the engineers are back in charge. We are seeing the rise of "Invisible Crypto"—blockchain technology that runs in the background of boring, everyday financial transactions.</p>
                <p><strong>No one will care about the price of Bitcoin.</strong></p>
                <p>Instead, they will care that international bank transfers now take seconds instead of days. They will care that concert tickets can\'t be scalped because the smart contract forbids it. They will care that supply chains are transparent.</p>
                <p>The next bull run won\'t be driven by hype; it will be driven by utility. It will be boring, stable, and foundational. And that is how you know it\'s finally real.</p>
            '
        ),
        array(
            'title'  => 'Bio-Hacking Goes Mainstream',
            'author' => 'Dr. Chen',
            'content' => '
                <p>It started with Fitbits. Then came Oura rings and Apple Watches. Now, we are crossing the skin barrier. Continuous Glucose Monitors (CGMs) are being worn by non-diabetics to optimize performance.</p>
                <p><strong>The quantified self is evolving into the optimized self.</strong></p>
                <p>By next year, we will see the first mass-market "smart patch" that analyzes sweat to track hydration and electrolyte levels in real-time. Nootropics are moving from the fringes of Silicon Valley to the shelves of Whole Foods.</p>
                <p>The line between "wellness" and "medical intervention" is blurring. We are treating our bodies like software platforms—debugging our sleep, patching our nutrition, and upgrading our focus. The danger, of course, is that we start to view normal human fluctuations as "system errors" that need to be fixed.</p>
            '
        ),
         array(
            'title'  => 'The End of the Smartphone Era',
            'author' => 'Jony I.',
            'content' => '
                <p>The rectangle of glass has peaked. It cannot get better, only faster. Sales are plateauing. Innovation has stalled. We are ready for the next form factor.</p>
                <p><strong>The AI Pin was a flop, but the idea wasn\'t.</strong></p>
                <p>We are moving toward multi-modal interfaces. Voice, gesture, and gaze will replace the tap and scroll. The smartphone will remain the "compute core" in your pocket, but you will look at it less and less.</p>
                <p>Your watch, your glasses, and your earbuds will handle the input and output. The phone becomes a server for your personal area network. We are decoupling the screen from the computer, and it will liberate our hands and our heads.</p>
            '
        ),
         array(
            'title'  => 'Subscription Fatigue Causes the "Great Unsub"',
            'author' => 'Netflix Chill',
            'content' => '
                <p>Everything is a subscription now. Your heated seats, your doorbell camera, your ad-free solitaire, your razor blades. Consumers have hit a wall.</p>
                <p><strong>The churn rates are skyrocketing.</strong></p>
                <p>We predict a massive return to the "One-Time Purchase" model. Software companies will rediscover that people actually like owning things. "Lifetime Licenses" will become the hottest marketing tactic of the year.</p>
                <p>Consumers are ruthlessly auditing their monthly recurring expenses. If a service doesn\'t provide daily value, it gets cut. The era of "set it and forget it" revenue for startups is over. You have to earn the renewal every single month.</p>
            '
        ),
    );

    // Loop through and insert posts
    foreach ( $predictions as $post_data ) {
        // Check if post exists by title to avoid duplicates
        if ( ! get_page_by_title( $post_data['title'], OBJECT, 'post' ) && ! get_page_by_title( $post_data['title'], OBJECT, 'prediction' ) ) {
            
            $post_id = wp_insert_post( array(
                'post_title'    => $post_data['title'],
                'post_content'  => $post_data['content'],
                'post_status'   => 'publish',
                'post_type'     => 'prediction', // or 'post'
                'post_author'   => 1, // Assigns to Admin
            ) );

            // If you want to force specific patterns, you can add term logic here, 
            // but your index.php already randomizes colors automatically!
        }
    }
}
add_action( 'init', 'techandhate_generate_content' );