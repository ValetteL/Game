<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PlanetRepository")
 */
class Planet
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="object")
     */
    private $geometryBase;

    /**
     * @ORM\Column(type="object")
     */
    private $terranGeom;

    /**
     * @ORM\Column(type="object")
     */
    private $terranHighGeom;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGeometryBase()
    {
        return $this->geometryBase;
    }

    public function setGeometryBase($geometryBase): self
    {
        $this->geometryBase = $geometryBase;

        return $this;
    }

    public function getTerranGeom()
    {
        return $this->terranGeom;
    }

    public function setTerranGeom($terranGeom): self
    {
        $this->terranGeom = $terranGeom;

        return $this;
    }

    public function getTerranHighGeom()
    {
        return $this->terranHighGeom;
    }

    public function setTerranHighGeom($terranHighGeom): self
    {
        $this->terranHighGeom = $terranHighGeom;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }
}
