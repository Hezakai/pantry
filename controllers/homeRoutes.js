const router = require("express").Router();
const { User, Inv, Rec, Ing, Step } = require("../models");
const withAuth = require("../utils/auth");

router.get("/", async (req, res) => {
  try {
    // Pass serialized data and session flag into template
    res.render("homepage", {
      logged_in: req.session.logged_in,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Use withAuth middleware to prevent access to route
router.get("/profile", withAuth, async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Inv,
        },
        {
          model: Rec,
          include: [
            { model: Ing },
            { model: Step },
          ],
        },
      ],
      order: [
        [Rec, Step, 'number', 'ASC']
      ],
    });

    const user = userData.get({ plain: true });
    console.log(user);

    res.render("profile", {
      user,
      logged_in: true,
    });
  } catch (err) {
    console.error("Error loading profile: ", err);
    res.status(500).json(err);
  }
});

router.get("/recipe/:id", withAuth, async (req, res) => {
  try {
    const recipeId = req.params.id;

    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Rec,
          where: { id: recipeId }, 
          include: [
            { model: Ing },
            { model: Step },
          ],
        },
      ],
      order: [
        [Rec, Step, 'number', 'ASC']
      ],
    });

    const user = userData.get({ plain: true });
    console.log(user);

    res.render("recipe", {
      user,
      logged_in: true,
    });
  } catch (err) {
    console.error("Error loading recipe: ", err);
    res.status(500).json(err);
  }
});


router.get("/login", (req, res) => {
  // If the user is already logged in, redirect the request to another route
  if (req.session.logged_in) {
    res.redirect("/profile");
    return;
  }

  res.render("login");
});

module.exports = router;
