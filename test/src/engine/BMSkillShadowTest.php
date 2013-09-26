<?php
/**
 * Generated by PHPUnit_SkeletonGenerator 1.2.0 on 2012-12-12 at 00:32:58.
 */

class BMSkillShadowTest extends PHPUnit_Framework_TestCase {
    /**
     * @var BMSkillShadow
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp()
    {
        $this->object = new BMSkillShadow;
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown()
    {
    }

    /**
     * @covers BMSkillShadow::attack_list
     */
    public function testAttack_list()
    {
        $a = array();

        $b = array(&$a);

        $this->object->attack_list($b);

        // Test adding Shadow
        $this->assertNotEmpty($a);

        $this->assertContains("Shadow", $a);

        // Only once
        $this->assertEquals(1, count($a));

        // Test adding Shadow to a non-empty array

        $a = array("Skill");

        $this->object->attack_list($b);

 
        $this->assertNotEmpty($a);

        $this->assertEquals(2, count($a));

        $this->assertContains("Shadow", $a);

        // Confirm other contents intact

        $this->assertContains("Skill", $a);

        // Test Power removal

        $a = array("Power", "Skill");

        $this->object->attack_list($b);

        $this->assertNotEmpty($a);

        $this->assertNotContains("Power", $a);

        // Check proper behavior not disrupted when removing Power

        $this->assertEquals(2, count($a));

        $this->assertContains("Shadow", $a);

        $this->assertContains("Skill", $a);


        // Check removing Power from the middle of longer lists

        $a = array("Speed", "Trip", "Power", "Skill");

        $this->object->attack_list($b);

        $this->assertNotEmpty($a);

        $this->assertNotContains("Power", $a);

        $this->assertEquals(4, count($a));

        // Check adding Shadow to an array already containing Shadow

        $a = array("Shadow", "Skill");

        $this->object->attack_list($b);

        $this->assertNotEmpty($a);

        $this->assertContains("Shadow", $a);

        $this->assertEquals(2, count($a));

    }
}
