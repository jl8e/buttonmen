<?php

require_once 'engine/BMButton.php';

/**
 * Generated by PHPUnit_SkeletonGenerator 1.2.0 on 2012-12-07 at 14:08:15.
 */
class BMButtonTest extends PHPUnit_Framework_TestCase {

    /**
     * @var BMButton
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp() {
        $this->object = new BMButton;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown() {

    }

    /**
     * @covers BMButton::loadFromRecipe
     */
    public function testLoadFromRecipe() {
        // button recipes using dice with no special skills
        $this->object->loadFromRecipe('4 8 20 20');
        $this->assertEquals(4, count($this->object->dieArray));
        $dieSides = [4, 8, 20, 20];
        for ($dieIdx = 0; $dieIdx <= (count($dieSides) - 1); $dieIdx++) {
          $this->assertTrue($this->object->dieArray[$dieIdx] instanceof BMDie);
          $this->assertEquals($dieSides[$dieIdx],
                              $this->object->dieArray[$dieIdx]->mSides);
        }

        $this->object->loadFromRecipe('6 10 12');
        $this->assertEquals(3, count($this->object->dieArray));
        $dieSides = [6, 10, 12];
        for ($dieIdx = 0; $dieIdx <= (count($dieSides) - 1); $dieIdx++) {
          $this->assertTrue($this->object->dieArray[$dieIdx] instanceof BMDie);
          $this->assertEquals($dieSides[$dieIdx],
                              $this->object->dieArray[$dieIdx]->mSides);
        }

        // button recipe with dice with skills
        $this->object->loadFromRecipe('p4 s10 ps30 8');
        $this->assertEquals(4, count($this->object->dieArray));
        $dieSides = [4, 10, 30, 8];
        $dieSkills = ['p', 's', 'ps', ''];
        for ($dieIdx = 0; $dieIdx <= (count($dieSides) - 1); $dieIdx++) {
          $this->assertTrue($this->object->dieArray[$dieIdx] instanceof BMDie);
          $this->assertEquals($dieSides[$dieIdx],
                              $this->object->dieArray[$dieIdx]->mSides);
          $this->assertEquals($dieSkills[$dieIdx],
                              $this->object->dieArray[$dieIdx]->mSkills);
        }

        // invalid button recipe with no die sides for one die
        try {
            $this->object->loadFromRecipe('p4 s10 ps 8');
            $this->fail('The number of sides must be specified for each die.');
        }
        catch (InvalidArgumentException $expected) {
        }

        // twin dice, option dice

    }

    /**
     * @covers BMButton::loadValues
     */
    public function testLoadValues() {
        $this->object->loadFromRecipe('4 8 12 20');
        $dieValues = [1, 2, 4, 9];
        $this->object->loadValues($dieValues);
        for ($dieIdx = 0; $dieIdx < count($dieValues); $dieIdx++) {
            $this->assertEquals($dieValues[$dieIdx],
                                $this->object->dieArray[$dieIdx]->scoreValue);
        }

        // test for same number of values as dice
        $this->object->loadFromRecipe('4 8 12 20');
        try {
            $this->object->loadValues('[1, 2, 3]');
            $this->fail('The number of values must match the number of dice.');
        }
        catch (InvalidArgumentException $expected) {
        }

        // test that value is within limits
        $this->object->loadFromRecipe('4 8 12 20');
        try {
            $this->object->loadValues('[5, 12, 20, 30]');
            $this->fail('Invalid values.');
        }
        catch (InvalidArgumentException $expected) {
        }
    }

    /**
     * @covers BMButton::validateRecipe
     */
    public function testValidateRecipe() {
        $method = new ReflectionMethod('BMButton', 'validateRecipe');
        $method->setAccessible(TRUE);

        // valid button recipe
        $method->invoke(new BMButton, 'p4 s10 ps30 8');

        // invalid button recipe with no die sides for one die
        try {
            $method->invoke(new BMButton, 'p4 s10 ps 8');
            //$this->fail('The number of sides must be specified for each die.');
        }
        catch (InvalidArgumentException $expected) {
        }

        // twin dice, option dice

        // swing dice
    }

    /**
     * @covers BMButton::parseRecipeForSides
     */
    public function testParseRecipeForSides() {
        $method = new ReflectionMethod('BMButton', 'parseRecipeForSides');
        $method->setAccessible(TRUE);

        $sides = $method->invoke(new BMButton, '4 8 20 20');
        $this->assertEquals([4, 8, 20, 20], $sides);

        $sides = $method->invoke(new BMButton, 'p4 s10 ps30 8');
        $this->assertEquals([4, 10, 30, 8], $sides);
    }

    /**
     * @covers BMButton::parseRecipeForSkills
     */
    public function testParseRecipeForSkills() {
        $method = new ReflectionMethod('BMButton', 'parseRecipeForSkills');
        $method->setAccessible(TRUE);

        $skills = $method->invoke(new BMButton, '4 8 20 20');
        $this->assertEquals(4, count($skills));
        $this->assertEquals(['', '', '', ''], $skills);

        $skills = $method->invoke(new BMButton, 'p4 s10 ps30 8');
        $this->assertEquals(['p', 's', 'ps', ''], $skills);
    }
}
